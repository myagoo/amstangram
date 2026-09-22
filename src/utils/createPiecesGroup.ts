import paper from "paper/dist/paper-core"
import {
  SMALL_TRIANGLE_BASE,
  INSET_BORDER,
  COLLISION_MARGIN,
} from "../constants"
import { getOffsettedPathPoints } from "./getOffsettedPathPoints"
import { getTriangleCenter } from "./getTriangleCenter"

const createTriangle = (size: number, id: import("../types").TanId) => {
  const points = [
    new paper.Point(0, 0),
    new paper.Point(size * 2, 0),
    new paper.Point(size, size),
  ]

  const displayShape = new paper.Path({
    name: "display",
    segments: points,
    closed: true,
  })

  const collisionShape = new paper.Path({
    name: "collision",
    segments: getOffsettedPathPoints(points, -COLLISION_MARGIN),
    closed: true,
  })

  const insetBorderShape = new paper.Path({
    name: "insetBorder",
    segments: getOffsettedPathPoints(points, -INSET_BORDER),
    closed: true,
    strokeWidth: INSET_BORDER,
  })

  const triangleCenter = getTriangleCenter(points)

  const center = new paper.Point(
    paper.view.center.x + triangleCenter.x - displayShape.bounds.width / 2,
    paper.view.center.y + triangleCenter.y - displayShape.bounds.height / 2
  )

  const group = new paper.Group({
    children: [displayShape, collisionShape, insetBorderShape],
    position: paper.view.center,
    pivot: center,
    data: { id, collisions: new Set() },
    applyMatrix: true,
  })

  return group as import("../types").TanGroup
}

const createRhombus = (size: number, id: import("../types").TanId) => {
  const points = [
    new paper.Point(0, 0),
    new paper.Point(size * 2, 0),
    new paper.Point(size * 3, size),
    new paper.Point(size, size),
  ]

  const displayShape = new paper.Path({
    name: "display",
    segments: points,
    closed: true,
  })

  const collisionShape = new paper.Path({
    name: "collision",
    segments: getOffsettedPathPoints(points, -COLLISION_MARGIN),
    closed: true,
    strokeWidth: COLLISION_MARGIN,
  })

  const insetBorderShape = new paper.Path({
    name: "insetBorder",
    segments: getOffsettedPathPoints(points, -INSET_BORDER),
    closed: true,
    strokeWidth: INSET_BORDER,
  })

  const group = new paper.Group({
    children: [displayShape, collisionShape, insetBorderShape],
    position: paper.view.center,
    data: { id, collisions: new Set() },
    applyMatrix: true,
  })

  return group as import("../types").TanGroup
}

const createSquare = (size: number, id: import("../types").TanId) => {
  const displayShape = new paper.Path.Rectangle({
    name: "display",
    point: [0, 0],
    size: [size, size],
  })

  const collisionShape = new paper.Path.Rectangle({
    name: "collision",
    point: [COLLISION_MARGIN, COLLISION_MARGIN],
    size: [size - COLLISION_MARGIN * 2, size - COLLISION_MARGIN * 2],
  })

  const insetBorderShape = new paper.Path.Rectangle({
    name: "insetBorder",
    point: [INSET_BORDER, INSET_BORDER],
    size: [size - INSET_BORDER * 2, size - INSET_BORDER * 2],
    strokeWidth: INSET_BORDER,
  })

  const group = new paper.Group({
    children: [displayShape, collisionShape, insetBorderShape],
    position: paper.view.center,
    data: { id, collisions: new Set() },
    applyMatrix: true,
    rotation: Math.round(Math.random() * 7) * 45,
  })

  return group as import("../types").TanGroup
}

export const createPiecesGroup = () => {
  const smallBase = SMALL_TRIANGLE_BASE
  const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
  const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)

  return new paper.Group([
    createTriangle(smallBase, "st1"),
    createTriangle(smallBase, "st2"),
    createTriangle(mediumBase, "mt1"),
    createTriangle(largeBase, "lt1"),
    createTriangle(largeBase, "lt2"),
    createSquare(mediumBase, "sq"),
    createRhombus(smallBase, "rh"),
  ]) as import("../types").PiecesGroup
}
