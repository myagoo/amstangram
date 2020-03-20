import paper from "paper/dist/paper-core"

export const getOffsettedPathsSegments = (pathsSegments, offset) => {
  const offsetter = new window.ClipperLib.ClipperOffset()

  const offsettedPathsPoints = new window.ClipperLib.Paths()

  offsetter.AddPaths(
    pathsSegments.map(pathSegments =>
      pathSegments.map(({ point: { x, y } }) => ({
        X: x,
        Y: y,
      }))
    ),
    window.ClipperLib.JoinType.jtMiter,
    window.ClipperLib.EndType.etClosedPolygon
  )

  offsetter.MiterLimit = 2
  offsetter.ArcTolerance = 0.25

  offsetter.Execute(offsettedPathsPoints, offset)

  if (offsettedPathsPoints.length) {
    return offsettedPathsPoints.map(offsettedPathPoints =>
      offsettedPathPoints.map(
        ({ X, Y }) => new paper.Segment(new paper.Point(X, Y))
      )
    )
  }
}
