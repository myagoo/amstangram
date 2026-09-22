import paper from "paper/dist/paper-core"
import type { Outline, PiecesGroup } from "../src/types"
import { getPathData } from "../src/utils/getPathData"
import { updateColisionState } from "../src/utils/updateColisionState"
import { isTangramComplete } from "../src/utils/isTangramComplete"
import { getSnapVector } from "../src/utils/getSnapVector"
import { getTangramDifficulty } from "../src/utils/getTangramDifficulty"
import { SMALL_TRIANGLE_BASE } from "../src/constants"

export function readTan(id: string) {
  const pieces = paper.project.activeLayer.children.find(item =>
    item instanceof paper.Group && item.children.length === 7 && item.children.some(child => child.data.id === id)
  ) as PiecesGroup
  const tan = pieces.children.find(piece => piece.data.id === id)!
  const path = tan.children.display
  const point = paper.view.projectToView(path.interiorPoint)
  return { x: point.x, y: point.y, area: path.area,
    points: path.segments.map(({ point }) => [point.x, point.y]) }
}

export function readScene() {
  const particles = paper.project.getItems({ class: paper.Path }).filter(item =>
    typeof item.data.index === "number"
  )
  return {
    tans: ["st1", "st2", "mt1", "lt1", "lt2", "sq", "rh"].map(readTan),
    particles: particles.map(item => ({
      x: item.position.x, y: item.position.y, width: item.bounds.width,
      opacity: item.opacity, color: item.fillColor?.toCSS(true),
    })),
  }
}

export function checkGeometry() {
  const pieces = paper.project.activeLayer.children.find(item =>
    item instanceof paper.Group && item.children.length === 7 && item.children[0].data.id === "st1"
  ) as PiecesGroup
  const originalArea = pieces.children.reduce((sum, piece) => sum + Math.abs(piece.children.display.area), 0)
  const first = pieces.children[0]
  const before = first.children.display.segments[0].point.clone()
  first.rotate(45)
  const rotated = !before.equals(first.children.display.segments[0].point)
  pieces.children.forEach((piece, index) => { piece.position = new paper.Point(index * 2000, 200) })
  // Join the two small triangles along their bases, keeping the actual tan geometry.
  pieces.children.slice(0, 2).forEach((piece, index) => {
    const [a, b] = piece.children.display.segments
    piece.rotate(index * 180 - b.point.subtract(a.point).angle)
  })
  pieces.children[1].translate(first.children.display.segments[1].point.subtract(pieces.children[1].children.display.segments[0].point))
  pieces.children.forEach(piece => updateColisionState(piece, pieces))
  const target = pieces.children.slice(1).reduce<Outline>((outline, piece) =>
    outline.unite(piece.children.display, { insert: false }) as Outline,
    first.children.display.clone({ insert: false })
  )
  const complete = isTangramComplete(target, pieces, 2)
  target.remove()
  const exported = getPathData(pieces, Math.sqrt(originalArea / (16 * SMALL_TRIANGLE_BASE ** 2)))
  const snapTarget = new paper.Path({ segments: [[0, 0], [100, 0], [0, 100]], closed: true, insert: false })
  const moving = snapTarget.clone({ insert: false })
  moving.translate(new paper.Point(3, 4))
  const snap = getSnapVector(10, moving, [snapTarget])
  const snapped = snap?.equals(new paper.Point(-3, -4))
  moving.remove()
  snapTarget.remove()
  const rhombus = pieces.children[6].children.display.clone({ insert: false })
  const area = rhombus.area
  rhombus.scale(-1, 1)
  const reflected = Math.abs(rhombus.area + area) < 0.001
  rhombus.remove()
  return {
    originalArea, rotated, reflected, snapped, edges: exported.edges, path: exported.path, complete,
    difficulties: [5, 8, 9, 16, 17, 22].map(edges => getTangramDifficulty({ edges }))
  }
}

export function sameOutline(a: string, b: string) {
  const first = new paper.CompoundPath({ pathData: a, insert: false })
  const second = new paper.CompoundPath({ pathData: b, insert: false })
  const firstPoints = first.curves.map(curve => curve.point1)
  const secondPoints = second.curves.map(curve => curve.point1)
  const matches = firstPoints.length === secondPoints.length && firstPoints.every((point, index) => point.getDistance(secondPoints[index]) < 0.0001)
  first.remove()
  second.remove()
  return matches
}
