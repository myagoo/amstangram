import paper from "paper/dist/paper-core"

export const getOffsettedPathPoints = (points, offset) => {
  const offsetter = new window.ClipperLib.ClipperOffset()

  const offsettedPathPoints = new window.ClipperLib.Paths()

  offsetter.AddPaths(
    [
      points.map(({ x, y }) => ({
        X: x,
        Y: y,
      })),
    ],
    window.ClipperLib.JoinType.jtMiter,
    window.ClipperLib.EndType.etClosedPolygon
  )

  offsetter.MiterLimit = 0
  offsetter.ArcTolerance = 0

  offsetter.Execute(offsettedPathPoints, offset)

  if (offsettedPathPoints.length) {
    return offsettedPathPoints[0].map(({ X, Y }) => new paper.Point(X, Y))
  }
}
