import paper from "paper/dist/paper-core"
import { ERROR_MARGIN, ERROR_STROKE, SMALL_TRIANGLE_BASE } from "../constants"
import { getOffsettedPoints } from "./getOffsettedPoints"
import { getTriangleCenter } from "./getTriangleCenter"

const createTriangle = (size, id, color) => {
  const points = [
    new paper.Point(0, 0),
    new paper.Point(size * 2, 0),
    new paper.Point(size, size),
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

  const triangleCenter = getTriangleCenter(points)

  const group = new paper.Group({
    children: [shape, inner],
    position: paper.view.center,
    pivot: [
      paper.view.center.x + triangleCenter.x - shape.bounds.width / 2,
      paper.view.center.y + triangleCenter.y - shape.bounds.height / 2,
    ],
    data: { id, collisions: new Set() },
    applyMatrix: true,
  })

  return group
}

const createRhombus = (size, id, color) => {
  const points = [
    new paper.Point(0, 0),
    new paper.Point(size * 2, 0),
    new paper.Point(size * 3, size),
    new paper.Point(size, size),
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
    data: { id, collisions: new Set() },
    applyMatrix: true,
  })

  return group
}

const createSquare = (size, id, color) => {
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
    data: { id, collisions: new Set() },
    applyMatrix: true,
    rotation: Math.round(Math.random() * 7) * 45,
  })

  return group
}

export const createPieces = themeColors => {
  const smallBase = SMALL_TRIANGLE_BASE
  const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
  const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)

  return [
    createTriangle(smallBase, "st1", themeColors["st1"]),
    createTriangle(smallBase, "st2", themeColors["st2"]),
    createTriangle(mediumBase, "mt1", themeColors["mt1"]),
    createTriangle(largeBase, "lt1", themeColors["lt1"]),
    createTriangle(largeBase, "lt2", themeColors["lt2"]),
    createSquare(mediumBase, "sq", themeColors["sq"]),
    createRhombus(smallBase, "rh", themeColors["rh"]),
  ]
}
