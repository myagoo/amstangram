import paper from "paper/dist/paper-core"
import React, { useContext, useEffect, useLayoutEffect, useRef } from "react"
import { ThemeContext } from "styled-components"
import { GalleryContext } from "../components/gallery-provider"
import { View } from "../components/view"

const SMALL_TRIANGLE_BASE = 50
const LENGTH_MIN = SMALL_TRIANGLE_BASE * 16.325
const LENGTH_MAX = SMALL_TRIANGLE_BASE * 49.25
const ERROR_MARGIN = 5
const OVERLAPING_OPACITY = 0.5

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

function contains(item1, item2) {
  return item2.segments.every(segment => item1.contains(segment.point))
}

export const Tangram = () => {
  const theme = useContext(ThemeContext)
  const canvasRef = useRef()
  const groupsRef = useRef()
  const coumpoundPathRef = useRef()
  const { onSaveRequest, selectedTangram } = useContext(GalleryContext)

  useEffect(() => {
    if (onSaveRequest) {
      onSaveRequest(getCompoundPath())
    }
  }, [onSaveRequest])

  function createRhombusGroup(size, id) {
    const points = [
      { x: 0, y: 0 },
      { x: size * 2, y: 0 },
      { x: size * 3, y: size },
      { x: size, y: size },
    ]

    const shape = new paper.Path({
      segments: points,
      closed: true,
      fillColor: theme.colors[id],
    })

    const inner = new paper.Path({
      segments: getOffsettedPoints(points, -ERROR_MARGIN),
      closed: true,
      strokeWidth: 2,
      strokeColor: theme.colors[id],
    })

    const group = new paper.Group({
      children: [shape, inner],
      position: paper.view.center,
      data: { id, collisions: new Set() },
      applyMatrix: true,
    })

    return group
  }

  function createSquareGroup(size, id) {
    const shape = new paper.Path.Rectangle({
      point: [0, 0],
      size: [size, size],
      fillColor: theme.colors[id],
    })

    const inner = new paper.Path.Rectangle({
      point: [ERROR_MARGIN, ERROR_MARGIN],
      size: [size - ERROR_MARGIN * 2, size - ERROR_MARGIN * 2],
      strokeWidth: 2,
      strokeColor: theme.colors[id],
    })

    const group = new paper.Group({
      children: [shape, inner],
      position: paper.view.center,
      data: { id, collisions: new Set() },
      applyMatrix: true,
    })

    return group
  }

  function createTriangleGroup(size, id) {
    const points = [
      { x: 0, y: 0 },
      { x: size * 2, y: 0 },
      { x: size, y: size },
    ]

    const shape = new paper.Path({
      segments: points,
      closed: true,
      fillColor: theme.colors[id],
    })

    const inner = new paper.Path({
      segments: getOffsettedPoints(points, -ERROR_MARGIN),
      closed: true,
      strokeWidth: 2,
      strokeColor: theme.colors[id],
    })

    const d1 = getDistanceBetweenPoints(points[1], points[2])
    const d2 = getDistanceBetweenPoints(points[0], points[2])
    const d3 = getDistanceBetweenPoints(points[0], points[1])

    const triangleCenterX =
      (points[0].x * d1 + points[1].x * d2 + points[2].x * d3) / shape.length
    const triangleCenterY =
      (points[0].y * d1 + points[1].y * d2 + points[2].y * d3) / shape.length

    const group = new paper.Group({
      children: [shape, inner],
      position: paper.view.center,
      pivot: [
        paper.view.center.x + triangleCenterX - shape.bounds.width / 2,
        paper.view.center.y + triangleCenterY - shape.bounds.height / 2,
      ],
      data: { id, collisions: new Set() },
      applyMatrix: true,
    })

    return group
  }

  useEffect(() => {
    if (!selectedTangram) {
      return
    }

    const item = paper.project.importSVG(selectedTangram, {})
    item.sendToBack()
    item.position = paper.view.center
    item.fillRule = "evenodd"
    item.fillColor = "black"
    item.closed = true

    coumpoundPathRef.current = item

    return () => {
      item.remove()
    }
  }, [selectedTangram])

  const getCompoundPath = () => {
    let compoundPath

    for (const group of groupsRef.current) {
      const path = group.firstChild
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

    const checkForIntersections = group => {
      for (const group2 of groupsRef.current) {
        if (group2 === group) {
          continue
        }

        if (
          group.lastChild.intersects(group2.lastChild) ||
          contains(group.lastChild, group2.lastChild) ||
          contains(group2.lastChild, group.lastChild)
        ) {
          group.data.collisions.add(group2.data.id)
          group2.data.collisions.add(group.data.id)
        } else {
          group.data.collisions.delete(group2.data.id)
          group2.data.collisions.delete(group.data.id)
        }
      }

      for (const otherGroup of groupsRef.current) {
        if (otherGroup.data.collisions.size > 0) {
          otherGroup.firstChild.fillColor = theme.colors.collision
          otherGroup.firstChild.opacity = OVERLAPING_OPACITY
        } else {
          otherGroup.firstChild.fillColor = theme.colors[otherGroup.data.id]
          otherGroup.firstChild.opacity = 1
        }
      }
    }

    function attachEvents(group) {
      group.on("mousedown", () => group.bringToFront())

      group.on("mouseup", check)

      group.on("mousedrag", mdEvent => {
        const newX = group.position.x + mdEvent.delta.x
        const newY = group.position.y + mdEvent.delta.y

        const isOutsideCanvas =
          newX - group.bounds.width / 2 <= 0 ||
          newY - group.bounds.height / 2 <= 0 ||
          newX + group.bounds.width / 2 > canvasRef.current.offsetWidth ||
          newY + group.bounds.height / 2 > canvasRef.current.offsetHeight

        if (isOutsideCanvas) {
          return
        }

        group.position.x = newX
        group.position.y = newY

        checkForIntersections(group)
      })

      group.on("doubleclick", mdEvent => {
        group.rotation += 45
        checkForIntersections(group)
      })
    }

    function check() {
      if (!coumpoundPathRef.current) {
        return
      }
      let newCoumpoundPath = coumpoundPathRef.current

      for (const group of groupsRef.current) {
        if (group.data.collisions.size > 0) {
          return
        }
        newCoumpoundPath = newCoumpoundPath.unite(group.lastChild, {
          insert: false,
        })
      }
      if (newCoumpoundPath.length === coumpoundPathRef.current.length) {
        alert("YOU WIN MOTHERFUCKER")
      }
    }

    function setupPieces() {
      const smallBase = SMALL_TRIANGLE_BASE
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)

      groupsRef.current = [
        createTriangleGroup(smallBase, "st1"),
        createTriangleGroup(smallBase, "st2"),
        createTriangleGroup(mediumBase, "mt1"),
        createTriangleGroup(largeBase, "lt1"),
        createTriangleGroup(largeBase, "lt2"),
        createSquareGroup(mediumBase, "sq"),
        createRhombusGroup(smallBase, "rh"),
      ]

      for (const group of groupsRef.current) {
        attachEvents(group)
        checkForIntersections(group)
      }
    }

    init()
  }, [])

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
