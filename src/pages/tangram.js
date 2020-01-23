import paper from "paper/dist/paper-core"

import React, { useContext, useEffect, useLayoutEffect, useRef } from "react"
import simplify from "simplify-js"
import { GalleryContext } from "../components/gallery-provider"
import { View } from "../components/view"

const STROKE_WIDTH = 1

const SMALL_TRIANGLE_BASE = 50
const LENGTH_MIN = SMALL_TRIANGLE_BASE * 16.325
const LENGTH_MAX = SMALL_TRIANGLE_BASE * 49.25
const ERROR_MARGIN = 5
const SIMPLIFY_TOLERANCE = 3
const SHAPE_PADDING = 5

function createRhombusGroup(size) {
  const points = [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size * 3, y: size },
    { x: size, y: size },
  ]
  const shape = new paper.Path({
    segments: points,
    closed: true,
    fillColor: paper.Color.random(),
  })

  const handle = new paper.Path.Circle({
    center: shape.bounds.center,
    radius: size / 2 - SHAPE_PADDING,
    fillColor: paper.Color.random(),
  })

  const group = new paper.Group({
    children: [shape, handle],
    position: paper.view.center,
  })

  handle.on("mousedrag", mdEvent => {
    group.position.x = group.position.x + mdEvent.delta.x
    group.position.y = group.position.y + mdEvent.delta.y
  })
  shape.on("click", mdEvent => {
    group.rotation += 45
  })
  return group
}

function createSquareGroup(size) {
  const shape = new paper.Path.Rectangle({
    point: [0, 0],
    size: [size, size],
    fillColor: paper.Color.random(),
  })

  const handle = new paper.Path.Circle({
    center: [size / 2, size / 2],
    radius: size / 2 - SHAPE_PADDING,
    fillColor: paper.Color.random(),
  })

  const group = new paper.Group({
    children: [shape, handle],
    position: paper.view.center,
  })

  handle.on("mousedrag", mdEvent => {
    group.position.x = group.position.x + mdEvent.delta.x
    group.position.y = group.position.y + mdEvent.delta.y
  })
  shape.on("click", mdEvent => {
    group.rotation += 45
  })
  return group
}

function createTriangleGroup(size) {
  const points = [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size, y: size },
  ]

  const shape = new paper.Path({
    segments: points,
    closed: true,
    fillColor: paper.Color.random(),
    applyMatrix: false,
  })

  const d1 = getDistanceBetweenPoints(points[1], points[2])
  const d2 = getDistanceBetweenPoints(points[0], points[2])
  const d3 = getDistanceBetweenPoints(points[0], points[1])

  const triangleCenterX =
    (points[0].x * d1 + points[1].x * d2 + points[2].x * d3) / shape.length
  const triangleCenterY =
    (points[0].y * d1 + points[1].y * d2 + points[2].y * d3) / shape.length

  const radius = getDistanceBetweenPoints(
    { x: triangleCenterX, y: triangleCenterY },
    { x: size, y: 0 }
  )

  const handle = new paper.Path.Circle({
    center: [triangleCenterX, triangleCenterY],
    radius: radius - SHAPE_PADDING,
    fillColor: paper.Color.random(),
    applyMatrix: false,
  })

  const group = new paper.Group({
    children: [shape, handle],
    position: paper.view.center,
    pivot: handle.bounds.center,
    applyMatrix: false,
  })

  handle.on("mousedrag", mdEvent => {
    group.position.x = group.position.x + mdEvent.delta.x
    group.position.y = group.position.y + mdEvent.delta.y
  })

  shape.on("click", mdEvent => {
    group.rotation += 45
  })

  return group
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
    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()
      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      // Create an empty project and a view for the canvas:
      paper.setup(canvasRef.current)
      setupPieces()
    }

    function createPiece(id, points, invertedPoints) {
      const group = new paper.Group()
      group.pivot = new paper.Point(0, 0)
      group.position = paper.view.center

      var path = new paper.Path(points)

      const handle = new paper.Path.Circle(
        path.bounds.center,
        Math.min(path.bounds.width, path.bounds.height) / 3
      )
      handle.fillColor = paper.Color.random()
      group.addChildren([path, handle])

      const color = paper.Color.random()
      path.strokeColor = color
      path.strokeWidth = STROKE_WIDTH
      path.fillColor = color
      path.closed = true
      path.applyMatrix = false

      if (invertedPoints) {
        let inverted = false

        path.on("doubleclick", () => {
          path.segments = inverted ? points : invertedPoints
          inverted = !inverted
        })
      }

      handle.on("mousedrag", mdEvent => {
        console.log("position", path.position)
        console.log("point", mdEvent.point)
        console.log("delta", mdEvent.delta)
        group.position.x = group.position.x + mdEvent.delta.x
        group.position.y = group.position.y + mdEvent.delta.y
      })

      group.on("mousedown", function(mdEvent) {
        group.bringToFront()

        function handleMouseMove(mmEvent) {}

        function handleMouseUp() {
          paper.view.off("mousemove", handleMouseMove)
          paper.view.off("mouseup", handleMouseUp)
          //addToempGallery(getCompoundPath())
          coumpoundPathRef.current && check()
        }

        paper.view.on("mousemove", handleMouseMove)
        paper.view.on("mouseup", handleMouseUp)
      })

      return { path, points, invertedPoints }
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
      createTriangleGroup(smallBase)
      createTriangleGroup(smallBase)
      createTriangleGroup(mediumBase)
      createTriangleGroup(largeBase)
      createTriangleGroup(largeBase)
      createSquareGroup(mediumBase)
      createRhombusGroup(smallBase)
      piecesRef.current = [
        // createPiece("ts1", createTrianglePoints(smallBase)),
        // createPiece("ts2", createTrianglePoints(smallBase)),
        // createPiece("tm", createTrianglePoints(mediumBase)),
        // createPiece("tl1", createTrianglePoints(largeBase)),
        // createPiece("tl2", createTrianglePoints(largeBase)),
        // createPiece("s", createSquarePoints(mediumBase)),
        // createPiece(
        //   "p",
        //   createRhombusPoints(smallBase),
        //   createInvertedRhombusPoints(smallBase)
        // ),
      ]
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
