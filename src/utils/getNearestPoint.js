import paper from "paper/dist/paper-core"

export const getNearestPoint = (point, startPoint, endPoint) => {
  const atob = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y }
  const atop = { x: point.x - startPoint.x, y: point.y - startPoint.y }
  const len = atob.x * atob.x + atob.y * atob.y
  let dot = atop.x * atob.x + atop.y * atob.y
  const t = Math.min(1, Math.max(0, dot / len))

  dot =
    (endPoint.x - startPoint.x) * (point.y - startPoint.y) -
    (endPoint.y - startPoint.y) * (point.x - startPoint.x)

  return new paper.Point(startPoint.x + atob.x * t, startPoint.y + atob.y * t)
}
