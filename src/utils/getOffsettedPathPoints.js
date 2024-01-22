import offsetPolygon from "offset-polygon"

export const getOffsettedPathPoints = (points, offset) => {
  return offsetPolygon(points, offset, 0)
}
