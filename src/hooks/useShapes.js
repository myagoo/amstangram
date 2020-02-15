import paper from "paper/dist/paper-core"
import { useCallback, useContext } from "react"
import { ERROR_MARGIN } from "../constants"
import { getOffsettedPoints } from "../utils/get-offsetted-points"
import { ThemeContext } from "../Theme"

const getDistanceBetweenPoints = (pointA, pointB) => {
  return Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
  )
}

export const useShapes = () => {
  const theme = useContext(ThemeContext)
  const createRhombusGroup = useCallback(
    (size, id) => {
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
    },
    [theme]
  )

  const createSquareGroup = useCallback(
    (size, id) => {
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
    },
    [theme]
  )

  const createTriangleGroup = useCallback(
    (size, id) => {
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
    },
    [theme]
  )

  return { createRhombusGroup, createSquareGroup, createTriangleGroup }
}
