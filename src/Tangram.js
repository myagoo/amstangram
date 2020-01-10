import paper from "paper/dist/paper-core"
import { MouseJoint, Polygon, Vec2, World } from "planck-js"
import React, { useLayoutEffect, useRef, useEffect } from "react"
import { Button } from "./components/button"
import { View } from "./components/view"

const SCALE = 30
const WALL_WIDTH = 10
const FPS = 60
const STROKE_WIDTH = 0

const LENGTH_MIN = 863
const LENGTH_MAX = 1970
const ERROR_SCALING = 1.04

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

export const Tangram = ({ onSave, patternImageDataUrl }) => {
  const canvasRef = useRef()
  const piecesRef = useRef()
  const worldRef = useRef()
  const groupRef = useRef()
  const patternsRef = useRef([])

  useEffect(() => {
    if (!patternImageDataUrl) {
      return
    }

    const group = new paper.Group()
    group.importSVG(patternImageDataUrl)
    group.children.forEach(child => {
      child.fillColor = "black"
      child.strokeWidth = 2
      child.strokeColor = "red"
    })
    group.sendToBack()
    group.position = paper.view.center
    groupRef.current = group

    const offsettedPaths = []

    const handleChild = path => {
      var co = new window.ClipperLib.ClipperOffset() // constructor

      co.AddPaths(
        [path.segments.map(({ point: { x, y } }) => ({ X: x, Y: y }))],
        true
      ) // we add paths only once

      var offsetted_paths = new window.ClipperLib.Paths() // empty solution
      co.Clear()
      co.AddPaths(
        [path.segments.map(({ point: { x, y } }) => ({ X: x, Y: y }))],
        window.ClipperLib.JoinType.jtMiter,
        window.ClipperLib.EndType.etClosedPolygon
      )

      co.MiterLimit = 2
      co.ArcTolerance = 0.25

      co.Execute(offsetted_paths, 5)

      const offsettedPath = new paper.Path(
        offsetted_paths[0].map(({ X, Y }) => ({
          x: X,
          y: Y,
        }))
      )
      offsettedPath.strokeWidth = 1
      offsettedPath.strokeColor = "red"
      offsettedPath.closed = true

      offsettedPaths.push(offsettedPath)
    }

    group.children.forEach(child => {
      if (child.children) {
        child.children.forEach(handleChild)
      } else {
        handleChild(child)
      }
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
            segments: tan.path.segments.map(segment =>
              tan.path.localToGlobal(segment.point)
            ),
            closed: true,
            scaling: ERROR_SCALING,
          }),
          { insert: false }
        )
      },
      new paper.Path({
        segments: firstTan.path.segments.map(segment =>
          firstTan.path.localToGlobal(segment.point)
        ),
        closed: true,
        scaling: ERROR_SCALING,
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
      setupPieces()
      paper.view.on("frame", tick)
    }

    function createPiece(points, invertedPoints) {
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
      }

      const bodyDef = {
        type: "dynamic",
        position: {
          x: 200 / SCALE,
          y: 200 / SCALE,
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
      const smallBase = 40
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)
      piecesRef.current = [
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(smallBase)),
        createPiece(createTrianglePoints(mediumBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createTrianglePoints(largeBase)),
        createPiece(createSquarePoints(mediumBase)),
        createPiece(
          createRhombusPoints(smallBase),
          createInvertedRhombusPoints(smallBase)
        ),
      ]
    }

    function createWall(width, height, position) {
      const wallBodyDef = {
        type: "static",
        position: {
          x: position.x / SCALE,
          y: position.y / SCALE,
        },
      }

      const wallBody = worldRef.current.createBody(wallBodyDef)

      const wallFixtureDef = {
        shape: new Polygon([
          new Vec2(0 / SCALE, 0 / SCALE),
          new Vec2(width / SCALE, 0 / SCALE),
          new Vec2(width / SCALE, height / SCALE),
          new Vec2(0 / SCALE, height / SCALE),
        ]),
      }

      wallBody.createFixture(wallFixtureDef)

      return wallBody
    }

    function setupPhysics() {
      const canvasRect = canvasRef.current.getBoundingClientRect()
      const gravity = new Vec2(0, 0)
      worldRef.current = new World(gravity, true)

      ground = createWall(canvasRect.width, WALL_WIDTH, { x: 0, y: 0 })
      createWall(canvasRect.width, WALL_WIDTH, {
        x: 0,
        y: canvasRect.height - WALL_WIDTH,
      })
      createWall(WALL_WIDTH, canvasRect.height, { x: 0, y: 0 })
      createWall(WALL_WIDTH, canvasRect.height, {
        x: canvasRect.width - WALL_WIDTH,
        y: 0,
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
