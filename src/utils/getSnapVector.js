import paper from "paper/dist/paper-core"
import { getNearestPoint } from "./getNearestPoint"

const getPrimarySnap = (shape, otherShapes, snap) => {
  for (const otherShape of otherShapes) {
    for (const { point: otherPoint } of otherShape.segments) {
      for (const { point: ghostPoint } of shape.segments) {
        const distance = ghostPoint.getDistance(otherPoint)
        if (distance < snap.distance) {
          snap.distance = distance
          snap.shape = otherShape
          snap.vector = otherPoint.subtract(ghostPoint)
        }
      }
    }
  }

  if (!snap.vector) {
    for (const otherShape of otherShapes) {
      for (const { point } of shape.segments) {
        for (const {
          point: startPoint,
          next: { point: endPoint },
        } of otherShape.segments) {
          const nearestPoint = getNearestPoint(point, startPoint, endPoint)
          const distance = nearestPoint.getDistance(point)
          if (distance < snap.distance) {
            snap.distance = distance
            snap.vector = nearestPoint.subtract(point)
            snap.shape = otherShape
            snap.segment = [startPoint, endPoint]
            snap.point = point
          }
        }
      }

      for (const { point: otherPoint } of otherShape.segments) {
        for (const {
          point: startPoint,
          next: { point: endPoint },
        } of shape.segments) {
          const nearestPoint = getNearestPoint(otherPoint, startPoint, endPoint)
          const distance = nearestPoint.getDistance(otherPoint)
          if (distance < snap.distance) {
            snap.distance = distance
            snap.vector = otherPoint.subtract(nearestPoint)
            snap.shape = shape
            snap.segment = [startPoint, endPoint]
          }
        }
      }
    }
  }

  return snap
}

const getSecondarySnap = (shape, otherShapes, snap) => {
  if (snap.segment) {
    let bestNewVectorLenth = snap.maxDistance
    let bestNewVector

    const [startPoint, endPoint] = snap.segment

    const angle1 = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x
    )
    const angle2 = Math.atan2(
      startPoint.y - endPoint.y,
      startPoint.x - endPoint.x
    )

    for (const angle of [angle1, angle2]) {
      for (const { point } of shape.segments) {
        if (point === snap.point) {
          //TODO snap.point should be an array of point when several points of the moved shape touch the snaped segment
          continue
        }
        const startPoint = point.add(snap.vector)

        const endPoint = new paper.Point(
          startPoint.x + snap.maxDistance * Math.cos(angle),
          startPoint.y + snap.maxDistance * Math.sin(angle)
        )

        const ray = new paper.Path.Line({
          from: startPoint,
          to: endPoint,
          insert: false,
        })

        for (const otherShape of otherShapes) {
          const intersections = ray.getIntersections(otherShape)

          for (const { point: intersectionPoint } of intersections) {
            const newVector = intersectionPoint
              .subtract(startPoint)
              .add(snap.vector)

            if (
              newVector.length < snap.maxDistance &&
              newVector.length <= bestNewVectorLenth
            ) {
              bestNewVectorLenth = newVector.length
              bestNewVector = newVector
            }
          }
        }
      }
    }

    if (bestNewVector) {
      snap.vector = bestNewVector
    }
  }
}

export const getSnapVector = (
  maxDistance,
  shape,
  otherPrimaryShapes,
  otherSecondaryShapes
) => {
  let snap = {
    maxDistance,
    distance: maxDistance,
  }

  getPrimarySnap(shape, otherPrimaryShapes, snap)

  if (otherSecondaryShapes) {
    getPrimarySnap(shape, otherSecondaryShapes, snap)
  }

  getSecondarySnap(
    shape,
    otherPrimaryShapes.filter((otherShape) => otherShape.shape !== snap.shape),
    snap
  )

  if (otherSecondaryShapes) {
    getSecondarySnap(shape, otherSecondaryShapes, snap)
  }

  return snap.vector
}
