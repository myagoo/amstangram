import paper from "paper/dist/paper-core"
import {
  Edge,
  MouseJoint,
  Polygon,
  RevoluteJoint,
  Vec2,
  World,
} from "planck-js"
import React, { useContext, useEffect, useLayoutEffect, useRef } from "react"
import simplify from "simplify-js"
import { GalleryContext } from "../components/gallery-provider"
import { View } from "../components/view"

const SCALE = 30
const FPS = 60
const STROKE_WIDTH = 1

const SMALL_TRIANGLE_BASE = 40
const LENGTH_MIN = SMALL_TRIANGLE_BASE * 16.325
const LENGTH_MAX = SMALL_TRIANGLE_BASE * 49.25
const ERROR_MARGIN = 5
const SIMPLIFY_TOLERANCE = 3
const SNAP_DISTANCE = 0.05
const SNAP_BREAK_DISTANCE = 1

function createTrianglePoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size, y: size },
  ]
}

function createSquarePoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size, y: 0 },
    { x: size, y: size },
    { x: 0, y: size },
  ]
}

function createInvertedRhombusPoints(size) {
  return [
    { x: size, y: 0 },
    { x: size * 3, y: 0 },
    { x: size * 2, y: size },
    { x: 0, y: size },
  ]
}

function createRhombusPoints(size) {
  return [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size * 3, y: size },
    { x: size, y: size },
  ]
}

const asArray = list => {
  const array = []
  let current = list
  while (current !== null) {
    array.push(current)
    current = current.next
  }
  return array
}

const getDistanceBetweenPoints = (pointA, pointB) => {
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
  )
}

const getOffsettedPoints = (points, offset) => {
  const co = new window.ClipperLib.ClipperOffset() // constructor

  const pathClipperPath = points.map(({ x, y }) => ({
    X: x,
    Y: y,
  }))

  const offsettedPaths = new window.ClipperLib.Paths() // empty solution

  co.AddPaths(
    [pathClipperPath],
    window.ClipperLib.JoinType.jtMiter,
    window.ClipperLib.EndType.etClosedPolygon
  )

  co.MiterLimit = 2
  co.ArcTolerance = 0.25

  co.Execute(offsettedPaths, offset)

  if (offsettedPaths.length) {
    return offsettedPaths[0].map(({ X, Y }) => new paper.Point(X, Y))
  }
}

export const Tangram = () => {
  const canvasRef = useRef()
  const piecesRef = useRef()
  const worldRef = useRef()
  const mouseJointRef = useRef()
  const coumpoundPathRef = useRef()
  const { selectedTangram, addToTempGallery } = useContext(GalleryContext)

  useEffect(() => {
    if (!selectedTangram) {
      return
    }

    const group = new paper.Group()

    const item = group.importSVG(selectedTangram, {})
    group.fillColor = "black"
    group.sendToBack()
    group.position = paper.view.center

    let paths

    if (item instanceof paper.CompoundPath) {
      paths = item.children
    } else {
      paths = [item]
    }

    const co = new window.ClipperLib.ClipperOffset() // constructor

    const simplifiedClipperPaths = paths.map(path => {
      const points = path.segments.map(({ point }) => point)

      const simplifiedPoints = simplify(points, SIMPLIFY_TOLERANCE, true)

      return simplifiedPoints.map(({ x, y }) => ({
        X: x,
        Y: y,
      }))
    })

    const resultPaths = new window.ClipperLib.Paths() // empty solution

    co.AddPaths(
      simplifiedClipperPaths,
      window.ClipperLib.JoinType.jtMiter,
      window.ClipperLib.EndType.etClosedPolygon
    )

    co.MiterLimit = 2
    co.ArcTolerance = 0.25

    co.Execute(resultPaths, ERROR_MARGIN)

    const coumpoundPath = new paper.CompoundPath({
      children: resultPaths.map(resultPath => {
        const offsettedPath = new paper.Path({
          segments: resultPath.map(({ X, Y }) => new paper.Point(X, Y)),
          insert: false,
        })
        return offsettedPath
      }),
      fillRule: "evenodd",
      fillColor: "green",
      closed: true,
      opacity: 0.5,
    })

    coumpoundPath.sendToBack()

    coumpoundPathRef.current = coumpoundPath

    return () => {
      group.remove()
      coumpoundPath.remove()
    }
  }, [selectedTangram])

  const getCompoundPath = () => {
    let compoundPath

    for (const { path } of piecesRef.current) {
      const offsettedPath = new paper.Path({
        segments: getOffsettedPoints(
          path.segments.map(segment => path.localToGlobal(segment.point)),
          1
        ),
        closed: true,
        insert: false,
      })
      if (!compoundPath) {
        compoundPath = offsettedPath
      } else {
        compoundPath = compoundPath.unite(offsettedPath, { insert: false })
      }
    }

    compoundPath.fillRule = "evenodd"
    compoundPath.closed = true
    compoundPath.position = new paper.Point(
      compoundPath.bounds.width / 2,
      compoundPath.bounds.height / 2
    )

    const svg = compoundPath
      .exportSVG({ asString: true })
      .replace(/fill="none"/g, "")
    const width = compoundPath.bounds.width
    const height = compoundPath.bounds.height
    const length = Math.ceil(compoundPath.length)
    const percent = Math.floor(
      ((length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
    )

    compoundPath.remove()

    return {
      svg,
      width,
      height,
      percent,
    }
  }

  useLayoutEffect(() => {
    let boxBody

    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()
      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      // Create an empty project and a view for the canvas:
      paper.setup(canvasRef.current)
      paper.view.autoUpdate = false
      setupPhysics()
      setupBox()
      setupPieces()
      paper.view.on("frame", tick)
    }

    function createPiece(id, points, invertedPoints) {
      var path = new paper.Path(points)
      const color = paper.Color.random()
      path.strokeColor = color
      path.strokeWidth = STROKE_WIDTH
      path.fillColor = color
      path.closed = true
      path.applyMatrix = false
      path.pivot = new paper.Point(0, 0)

      const body = worldRef.current.createDynamicBody({
        position: {
          x: canvasRef.current.width / SCALE / (2 * window.devicePixelRatio),
          y: canvasRef.current.height / SCALE / (2 * window.devicePixelRatio),
        },
        linearDamping: 100.0,
        angularDamping: 100.0,
      })

      const vertices = []
      for (let i = 0; i < points.length; i++) {
        vertices[i] = new Vec2(points[i].x / SCALE, points[i].y / SCALE)
      }

      const fixtureDef = {
        density: 1000,
        friction: 0,
        restitution: 0,
        shape: new Polygon(vertices),
        userData: id,
      }

      body.createFixture(fixtureDef)

      paper.view.on("frame", function() {
        const position = body.getPosition()
        path.position = new paper.Point(position.x * SCALE, position.y * SCALE)
        path.rotation = body.getAngle() * (180 / Math.PI)
      })

      path.on("click", () => {
        if (window.event.ctrlKey || window.event.metaKey) {
          if (body.getType() === "dynamic") {
            body.setType("static")
            body.setAwake(false)
            path.opacity = 0.5
          } else {
            body.setType("dynamic")
            body.setAwake(true)
            path.opacity = 1
          }
        }
      })

      if (invertedPoints) {
        let inverted = false

        const invertedVertices = []

        for (let i = 0; i < invertedPoints.length; i++) {
          invertedVertices[i] = new Vec2(
            invertedPoints[i].x / SCALE,
            invertedPoints[i].y / SCALE
          )
        }

        const invertedFixtureDef = {
          density: 1000,
          friction: 0,
          restitution: 0,
          shape: new Polygon(invertedVertices),
        }

        path.on("doubleclick", () => {
          body.destroyFixture(body.getFixtureList())
          body.createFixture(inverted ? fixtureDef : invertedFixtureDef)
          path.segments = inverted ? points : invertedPoints
          inverted = !inverted
        })
      }

      path.on("mousedown", function(mdEvent) {
        if (window.event.ctrlKey || window.event.metaKey) {
          return
        }

        body.setType("dynamic")
        body.getFixtureList().setDensity(1)
        body.resetMassData()
        body.setBullet(true)

        function handleMouseMove(mmEvent) {
          const mousePoint = new Vec2(
            mmEvent.point.x / SCALE,
            mmEvent.point.y / SCALE
          )
          if (!mouseJointRef.current) {
            const mouseJointDef = {
              bodyA: boxBody,
              bodyB: body,
              target: mousePoint,
              collideConnected: true,
              maxForce: 2000 * body.getMass(),
              dampingRatio: 0,
            }

            mouseJointRef.current = worldRef.current.createJoint(
              MouseJoint(mouseJointDef)
            )
          } else {
            mouseJointRef.current.setTarget(mousePoint)

            const bodyAnchorPoint = body.getWorldPoint(
              mouseJointRef.current.m_localAnchorB
            )

            const distance = getDistanceBetweenPoints(
              mousePoint,
              bodyAnchorPoint
            )

            if (distance > SNAP_BREAK_DISTANCE) {
              asArray(body.getJointList()).forEach(joint => {
                if (joint.joint.m_type === "revolute-joint") {
                  worldRef.current.destroyJoint(joint.joint)
                }
              })
            }
          }
        }

        function handleMouseUp() {
          paper.view.off("mousemove", handleMouseMove)
          paper.view.off("mouseup", handleMouseUp)
          if (mouseJointRef.current) {
            worldRef.current.destroyJoint(mouseJointRef.current)
            mouseJointRef.current = null
          }

          body.setType("static")
          body.setBullet(false)
          body.getFixtureList().setDensity(1000)
          body.resetMassData()

          addToTempGallery(getCompoundPath())

          coumpoundPathRef.current && check()
        }

        paper.view.on("mousemove", handleMouseMove)
        paper.view.on("mouseup", handleMouseUp)
      })

      return { body, path, points, invertedPoints }
    }

    function check() {
      let newCoumpoundPath = coumpoundPathRef.current
      for (const { path } of piecesRef.current) {
        newCoumpoundPath = newCoumpoundPath.unite(path, { insert: false })
      }
      if (newCoumpoundPath.length === coumpoundPathRef.current.length) {
        alert("YOU WIN MOTHERFUCKER")
      }
    }

    function setupPieces() {
      const smallBase = SMALL_TRIANGLE_BASE
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)
      piecesRef.current = [
        createPiece("ts1", createTrianglePoints(smallBase)),
        createPiece("ts2", createTrianglePoints(smallBase)),
        createPiece("tm", createTrianglePoints(mediumBase)),
        createPiece("tl1", createTrianglePoints(largeBase)),
        createPiece("tl2", createTrianglePoints(largeBase)),
        createPiece("s", createSquarePoints(mediumBase)),
        createPiece(
          "p",
          createRhombusPoints(smallBase),
          createInvertedRhombusPoints(smallBase)
        ),
      ]
    }

    function setupBox() {
      const canvasRect = canvasRef.current.getBoundingClientRect()

      boxBody = worldRef.current.createBody({
        position: {
          x: 0,
          y: 0,
        },
      })

      const width = canvasRect.width / SCALE
      const height = canvasRect.height / SCALE

      // Top
      boxBody.createFixture(new Edge(new Vec2(0, 0), new Vec2(width, 0)), 0)

      // Right
      boxBody.createFixture(
        new Edge(new Vec2(width, 0), new Vec2(width, height)),
        0
      )
      // Bottom
      boxBody.createFixture(
        new Edge(new Vec2(width, height), new Vec2(0, height)),
        0
      )
      // Left
      boxBody.createFixture(new Edge(new Vec2(0, height), new Vec2(0, 0)), 0)
    }

    function setupPhysics() {
      const gravity = new Vec2(0, 0)
      worldRef.current = new World(gravity, true)

      let timeoutId
      let initDone = false

      worldRef.current.on("post-solve", contact => {
        if (!initDone) {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => {
            piecesRef.current.forEach(({ body }) => {
              body.setType("static")
            })
            initDone = true
          }, 200)
        }

        const fixtureA = contact.m_fixtureA
        const fixtureB = contact.m_fixtureB

        const bodyA = fixtureA.m_body
        const bodyB = fixtureB.m_body

        const draggedBody =
          mouseJointRef.current && mouseJointRef.current.m_bodyB

        if (
          boxBody === bodyA ||
          boxBody === bodyB ||
          (draggedBody !== bodyA && draggedBody !== bodyB)
        ) {
          return
        }

        fixtureA.m_shape.m_vertices.forEach(pointA => {
          const worldPointA = bodyA.getWorldPoint(pointA)

          fixtureB.m_shape.m_vertices.forEach(pointB => {
            const worldPointB = bodyB.getWorldPoint(pointB)

            const distance = getDistanceBetweenPoints(worldPointA, worldPointB)

            if (distance < SNAP_DISTANCE) {
              const alreadyHasRevoluteJoint = asArray(
                bodyA.getJointList()
              ).some(joint => {
                return (
                  joint.joint.m_type === "revolute-joint" &&
                  joint.other === bodyB
                )
              })

              if (!alreadyHasRevoluteJoint) {
                setTimeout(() => {
                  const revoluteJoint = new RevoluteJoint({
                    localAnchorA: pointA,
                    localAnchorB: pointB,
                    referenceAngle: 0,
                    bodyA: bodyA,
                    bodyB: bodyB,
                    collideConnected: true,
                  })
                  worldRef.current.createJoint(revoluteJoint)
                })
              }
            }
          })
        })
      })
    }

    function tick() {
      paper.view.update()
      worldRef.current.step(1 / FPS, 10, 10)
      worldRef.current.clearForces()
    }

    init()
  }, [addToTempGallery])

  return (
    <View
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background="#b7efe0"
    >
      <View width="50vw" height="80%" background="#fff">
        <View as="canvas" ref={canvasRef} flex="1" />
      </View>
    </View>
  )
}
