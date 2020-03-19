import paper from "paper/dist/paper-core"

export const getOffsettedPoints = (points, offset) => {
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
