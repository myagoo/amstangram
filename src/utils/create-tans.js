import paper from "paper/dist/paper-core"
import { ERROR_MARGIN, ERROR_STROKE } from "../constants"
import { getDistanceBetweenPoints } from "./get-distance-between-points"
import { getOffsettedPoints } from "./get-offsetted-points"

export const createTriangle = (size, id, color) => {
  const points = [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size, y: size },
  ]

  const shape = new paper.Path({
    segments: points,
    closed: true,
    fillColor: color,
  })

  const inner = new paper.Path({
    segments: getOffsettedPoints(points, -ERROR_MARGIN),
    closed: true,
    strokeWidth: ERROR_STROKE,
    strokeColor: color,
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
    data: { id, collisions: new Set(), maxDegree: 360 },
    applyMatrix: true,
  })

  return group
}

export const createRhombus = (size, id, color) => {
  const points = [
    { x: 0, y: 0 },
    { x: size * 2, y: 0 },
    { x: size * 3, y: size },
    { x: size, y: size },
  ]

  const shape = new paper.Path({
    segments: points,
    closed: true,
    fillColor: color,
  })

  const inner = new paper.Path({
    segments: getOffsettedPoints(points, -ERROR_MARGIN),
    closed: true,
    strokeWidth: ERROR_STROKE,
    strokeColor: color,
  })

  const group = new paper.Group({
    children: [shape, inner],
    position: paper.view.center,
    data: { id, collisions: new Set(), maxDegree: 180 },
    applyMatrix: true,
  })

  return group
}

export const createSquare = (size, id, color) => {
  const shape = new paper.Path.Rectangle({
    point: [0, 0],
    size: [size, size],
    fillColor: color,
  })

  const inner = new paper.Path.Rectangle({
    point: [ERROR_MARGIN, ERROR_MARGIN],
    size: [size - ERROR_MARGIN * 2, size - ERROR_MARGIN * 2],
    strokeWidth: ERROR_STROKE,
    strokeColor: color,
  })

  const group = new paper.Group({
    children: [shape, inner],
    position: paper.view.center,
    data: { id, collisions: new Set(), maxDegree: 90 },
    applyMatrix: true,
  })

  return group
}
