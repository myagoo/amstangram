import paper from "paper/dist/paper-core"

export const getTriangleCenter = points => {
  const d1 = points[1].getDistance(points[2])
  const d2 = points[0].getDistance(points[2])
  const d3 = points[0].getDistance(points[1])

  const perimeter = d1 + d2 + d3

  const triangleCenterX =
    (points[0].x * d1 + points[1].x * d2 + points[2].x * d3) / perimeter
  const triangleCenterY =
    (points[0].y * d1 + points[1].y * d2 + points[2].y * d3) / perimeter

  return new paper.Point(triangleCenterX, triangleCenterY)
}
