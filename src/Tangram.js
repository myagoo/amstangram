import paper from "paper/dist/paper-core"
import {
  Edge,
  internal,
  MouseJoint,
  Polygon,
  Transform,
  Vec2,
  World,
} from "planck-js"
import React, { useEffect, useLayoutEffect, useRef } from "react"
import simplify from "simplify-js"
import { Button } from "./components/button"
import { View } from "./components/view"

const SCALE = 30
const FPS = 60
const STROKE_WIDTH = 1

const SMALL_TRIANGLE_BASE = 40
const LENGTH_MIN = SMALL_TRIANGLE_BASE * 21.575
const LENGTH_MAX = SMALL_TRIANGLE_BASE * 49.25
const ERROR_MARGIN = 5
const SIMPLIFY_TOLERANCE = 3

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

const getOffsettedPoints = (points, offset) => {
  const co = new window.ClipperLib.ClipperOffset() // constructor

  const pathClipperPath = points.map(({ x, y }) => ({
    X: x,
    Y: y,
  }))

  co.AddPaths([pathClipperPath], true) // we add paths only once

  const offsettedPaths = new window.ClipperLib.Paths() // empty solution
  co.Clear()
  co.AddPaths(
    [pathClipperPath],
    window.ClipperLib.JoinType.jtMiter,
    window.ClipperLib.EndType.etClosedPolygon
  )

  co.MiterLimit = 2
  co.ArcTolerance = 0.25

  co.Execute(offsettedPaths, offset)

  return offsettedPaths[0].map(({ X, Y }) => new paper.Point(X, Y))
}

export const Tangram = ({ onSave, patternImageDataUrl }) => {
  const canvasRef = useRef()
  const piecesRef = useRef()
  const worldRef = useRef()
  const patternsRef = useRef([])

  useEffect(() => {
    if (!patternImageDataUrl) {
      return
    }

    const group = new paper.Group()

    const item = group.importSVG(patternImageDataUrl, {})
    group.fillColor = "black"
    group.sendToBack()
    group.position = paper.view.center

    let paths

    if (item instanceof paper.CompoundPath) {
      paths = item.children
    } else {
      paths = [item]
    }

    const offsettedPaths = paths.map(path => {
      const points = path.segments.map(({ point }) => point)
      const simplifiedPoints = simplify(points, SIMPLIFY_TOLERANCE, true)
      path.segments = simplifiedPoints

      const offsettedPath = new paper.Path({
        segments: getOffsettedPoints(simplifiedPoints, ERROR_MARGIN),
        fillColor: "green",
        closed: true,
        opacity: 0.5,
      })

      offsettedPath.sendToBack()

      return offsettedPath
    })

    patternsRef.current = offsettedPaths

    return () => {
      group.remove()
      offsettedPaths.forEach(path => path.remove())
    }
  }, [patternImageDataUrl])

  const getCompoundPath = () => {
    const [firstTan, ...otherTans] = [...piecesRef.current]

    const result = otherTans.reduce(
      (compoundPath, tan, i) => {
        return compoundPath.unite(
          new paper.Path({
            segments: getOffsettedPoints(
              tan.path.segments.map(segment =>
                tan.path.localToGlobal(segment.point)
              ),
              1
            ),
            closed: true,
          }),
          { insert: false }
        )
      },
      new paper.Path({
        segments: getOffsettedPoints(
          firstTan.path.segments.map(segment =>
            firstTan.path.localToGlobal(segment.point)
          ),
          1
        ),
        closed: true,
      })
    )
    result.fillRule = "evenodd"
    result.closed = true
    result.fillColor = "black"
    result.position = new paper.Point(
      result.bounds.width / 2,
      result.bounds.height / 2
    )

    const svg = result.exportSVG({ asString: true })
    const width = result.bounds.width
    const height = result.bounds.height
    const length = Math.ceil(result.length)
    const percent = Math.floor(
      ((length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
    )

    result.remove()

    return {
      svg,
      width,
      height,
      percent,
    }
  }

  useLayoutEffect(() => {
    let ground

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
      path.strokeColor = "black"
      path.strokeWidth = STROKE_WIDTH
      path.fillColor = paper.Color.random()
      path.closed = true
      path.applyMatrix = false
      path.pivot = new paper.Point(0, 0)

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

      const bodyDef = {
        type: "dynamic",
        position: {
          x: canvasRef.current.width / 2 / SCALE,
          y: canvasRef.current.height / 2 / SCALE,
        },

        linearDamping: 100.0,
        angularDamping: 100.0,
      }

      const body = worldRef.current.createBody(bodyDef)
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
        var physicsMoveJoint

        body.getFixtureList().setDensity(1)
        body.resetMassData()
        body.setBullet(true)

        function handleMouseMove(mmEvent) {
          const physicsPoint = new Vec2(
            mmEvent.point.x / SCALE,
            mmEvent.point.y / SCALE
          )
          if (!physicsMoveJoint) {
            const mouseJointDef = {
              bodyA: ground,
              bodyB: body,
              target: physicsPoint,
              collideConnected: true,
              maxForce: 2000 * body.getMass(),
              dampingRatio: 0,
            }
            physicsMoveJoint = worldRef.current.createJoint(
              MouseJoint(mouseJointDef)
            )
          } else {
            physicsMoveJoint.setTarget(physicsPoint)
          }
        }

        function handleMouseUp() {
          paper.view.off("mousemove", handleMouseMove)
          paper.view.off("mouseup", handleMouseUp)
          if (physicsMoveJoint) {
            worldRef.current.destroyJoint(physicsMoveJoint)
          }
          body.setBullet(false)
          body.getFixtureList().setDensity(1000)
          body.resetMassData()

          patternsRef.current && check()
        }

        paper.view.on("mousemove", handleMouseMove)
        paper.view.on("mouseup", handleMouseUp)
      })

      return { body, path, points, invertedPoints }
    }

    function intersects(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
      const det = (ax2 - ax1) * (by2 - by1) - (bx2 - bx1) * (ay2 - ay1)
      if (det === 0) {
        return false
      } else {
        const lambda =
          ((by2 - by1) * (bx2 - ax1) + (bx1 - bx2) * (by2 - ay1)) / det
        const gamma =
          ((ay1 - ay2) * (bx2 - ax1) + (ax2 - ax1) * (by2 - ay1)) / det
        return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1
      }
    }

    function check() {
      // on verifie que points des pieces est à l'intereieuse de chaque polygon
      // on verifie que chq rayon allant vers un pt des pieces intersecte

      const patternsPoints = patternsRef.current.map(path =>
        path.segments.map(segment => path.localToGlobal(segment.point))
      )

      const everyPiecePointIsWithingPattern = piecesRef.current.every(
        ({ path }) => {
          return path.segments.every((segment, j) => {
            let intersect = 0
            const piecePoint = path.localToGlobal(segment.point)

            for (let i = 0; i < patternsPoints.length; i++) {
              const patternPoints = patternsPoints[i]
              let lastPatternPoint = patternPoints[patternPoints.length - 1]
              for (let j = 0; j < patternPoints.length; j++) {
                const currentPatternPoint = patternPoints[j]
                if (
                  intersects(
                    0,
                    0,
                    piecePoint.x,
                    piecePoint.y,
                    lastPatternPoint.x,
                    lastPatternPoint.y,
                    currentPatternPoint.x,
                    currentPatternPoint.y
                  )
                ) {
                  intersect++
                }
                lastPatternPoint = currentPatternPoint
              }
            }

            const isOdd = intersect % 2

            return isOdd
          })
        }
      )
      if (everyPiecePointIsWithingPattern) {
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

      ground = worldRef.current.createBody({
        position: {
          x: canvasRect.width / 2 / SCALE,
          y: canvasRect.height / 2 / SCALE,
        },
      })

      const SIZE = 600

      // Floor
      ground.createFixture(
        new Edge(
          new Vec2(-SIZE / 2 / SCALE, -SIZE / 2 / SCALE),
          new Vec2(SIZE / 2 / SCALE, -SIZE / 2 / SCALE)
        ),
        0
      )
      ground.createFixture(
        new Edge(
          new Vec2(SIZE / 2 / SCALE, -SIZE / 2 / SCALE),
          new Vec2(SIZE / 2 / SCALE, SIZE / 2 / SCALE)
        ),
        0
      )
      ground.createFixture(
        new Edge(
          new Vec2(SIZE / 2 / SCALE, SIZE / 2 / SCALE),
          new Vec2(-SIZE / 2 / SCALE, SIZE / 2 / SCALE)
        ),
        0
      )
      ground.createFixture(
        new Edge(
          new Vec2(-SIZE / 2 / SCALE, SIZE / 2 / SCALE),
          new Vec2(-SIZE / 2 / SCALE, -SIZE / 2 / SCALE)
        ),
        0
      )

      var rect = new paper.Rectangle([-SIZE / 2, -SIZE / 2], [SIZE, SIZE])
      rect.center = paper.view.center
      var path = new paper.Path.Rectangle(rect)

      path.strokeColor = "black"
      path.strokeWidth = 1
    }

    function setupPhysics() {
      const gravity = new Vec2(0, 0)
      worldRef.current = new World(gravity, true)

      worldRef.current.on("begin-contact", contact => {
        var transformA = Transform(
          contact.m_fixtureA.m_body.getPosition(),
          contact.m_fixtureA.m_body.getAngle()
        )
        var transformB = Transform(
          contact.m_fixtureB.m_body.getPosition(),
          contact.m_fixtureB.m_body.getAngle()
        )

        console.log(contact)
        var input = new internal.Distance.Input()
        input.proxyA.set(contact.m_fixtureA.m_shape, 0)
        input.proxyB.set(contact.m_fixtureB.m_shape, 0)
        input.transformA = transformA
        input.transformB = transformB
        input.useRadii = true
        var output = new internal.Distance.Output()
        var cache = new internal.Distance.Cache()
        internal.Distance(output, cache, input)
        console.log(output.distance)
      })
    }

    function tick() {
      paper.view.update()
      worldRef.current.step(1 / FPS, 10, 10)
      worldRef.current.clearForces()
    }

    init()
  }, [])

  return (
    <View display="flex" flexDirection="column" flex="1" position="relative">
      <View as="canvas" ref={canvasRef} flex="1" />
      <Button
        position="absolute"
        top={10}
        right={10}
        onClick={() => onSave(getCompoundPath())}
      >
        Add to Galery
      </Button>
    </View>
  )
}
