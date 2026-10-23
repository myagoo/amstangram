import paper from "paper/dist/paper-core"
import {
  generateTangrams,
  createRandom,
} from "../vendor/tangram-generator/generator"
import { convertTangram } from "../src/generation/generate"
import { createPiecesGroup } from "../src/utils/createPiecesGroup"
import { recomputePathData } from "../src/utils/recomputePathData"
import { isTangramComplete } from "../src/utils/isTangramComplete"
import { updateColisionState } from "../src/utils/updateColisionState"
import type { PiecesGroup, Outline } from "../src/types"
import { generationSeeds } from "./generationSeeds"

const ids = ["lt1", "lt2", "mt1", "st1", "st2", "sq", "rh"]

function candidateFor(seed: number, edges: number) {
  const random = createRandom(seed)
  for (let i = 0; i < 100000; i++) {
    const candidate = generateTangrams(1, undefined, random)[0]
    if (candidate.outline?.reduce((n, ring) => n + ring.length, 0) !== edges)
      continue
    const puzzle = convertTangram(candidate)
    if (puzzle?.edges === edges) return { candidate, puzzle }
  }
  throw new Error("Fixture search exhausted")
}

export function inspectConvertedFixtures() {
  const previous = paper.project
  const project = new paper.Project(document.createElement("canvas"))
  project.view.viewSize = new paper.Size(627, 863)
  const random = createRandom(42)
  let holes = 0
  let checked = 0
  let rejected = 0
  const mirrors = new Set<number>()
  try {
    const candidates = [
      ...Array.from(
        { length: 100 },
        () => generateTangrams(1, undefined, random)[0]
      ),
      ...Object.values(generationSeeds).map(
        (seed) => generateTangrams(1, undefined, createRandom(seed))[0]
      ),
    ]
    for (const [i, candidate] of candidates.entries()) {
      const puzzle = convertTangram(candidate)
      if (!puzzle) {
        rejected++
        continue
      }
      checked++
      const pieces = createPiecesGroup(() => 0)
      const all = candidate.tans.flatMap((tan) => tan.getPoints())
      const minX = Math.min(...all.map((point) => point.toFloatX()))
      const minY = Math.min(...all.map((point) => point.toFloatY()))
      candidate.tans.forEach((tan, index) => {
        mirrors.add(tan.tanType)
        const group = pieces.children.find(
          (piece) => piece.data.id === ids[index]
        )!
        const points = tan
          .getPoints()
          .map(
            (point) =>
              new paper.Point(
                ((point.toFloatX() - minX) * 50) / 6,
                ((point.toFloatY() - minY) * 50) / 6
              )
          )
        // Match actual game tans by rigid transforms, never replace their geometry.
        fit(group, points)
      })
      for (const piece of pieces.children) updateColisionState(piece, pieces)
      const target = new paper.CompoundPath({
        pathData: puzzle.path,
        insert: false,
      })
      if (target.children.length > 1) holes++
      if (!isTangramComplete(target, pieces, 2))
        throw new Error(`Fixture ${i} is not completable`)
      const saved = recomputePathData(puzzle.path)
      if (
        saved.edges !== puzzle.edges ||
        Math.abs(saved.length - puzzle.length) > 1
      )
        throw new Error(
          `Game metadata mismatch at ${i}: saved ${JSON.stringify(saved)}, converted ${JSON.stringify(puzzle)}`
        )
      if (Math.abs(Math.abs(target.area) - 40000) > 0.02)
        throw new Error("Wrong scale or lost coverage")
      pieces.remove()
      target.remove()
    }
    return {
      checked,
      rejected,
      holes,
      mirrored: mirrors.has(4) && mirrors.has(5),
      remainingItems: project.activeLayer.children.length,
    }
  } finally {
    project.remove()
    previous.activate()
  }
}

function equalShape(actual: paper.Point[], wanted: paper.Point[]) {
  const center = (points: paper.Point[]) =>
    points
      .reduce((sum, p) => sum.add(p), new paper.Point(0, 0))
      .divide(points.length)
  const a = center(actual),
    b = center(wanted)
  return actual.every((p) =>
    wanted.some((q) => p.subtract(a).getDistance(q.subtract(b)) < 0.001)
  )
}

function fit(group: PiecesGroup["children"][number], points: paper.Point[]) {
  for (let flip = 0; flip < 2; flip++) {
    for (let turn = 0; turn < 8; turn++) {
      if (
        equalShape(
          group.children.display.segments.map(({ point }) => point),
          points
        )
      ) {
        const from = group.children.display.segments
          .reduce((sum, { point }) => sum.add(point), new paper.Point(0, 0))
          .divide(points.length)
        const to = points
          .reduce((sum, point) => sum.add(point), new paper.Point(0, 0))
          .divide(points.length)
        group.translate(to.subtract(from))
        return
      }
      group.rotate(45)
    }
    group.scale(-1, 1)
  }
  throw new Error("Generator tan does not fit a game tan")
}

export function readGeneratedTarget() {
  const target = paper.project.activeLayer.children.find(
    (item) => item instanceof paper.Path || item instanceof paper.CompoundPath
  ) as Outline
  return { path: target.pathData, edges: target.curves.length }
}

// UI solver: observe the actual scene; all movement/rotation is performed by mouse events.
export function nextMove(id: string, seed: number, edges: number) {
  const { candidate, puzzle } = candidateFor(seed, edges)
  const target = paper.project.activeLayer.children.find(
    (item) => item instanceof paper.Path || item instanceof paper.CompoundPath
  ) as Outline
  const pieces = paper.project.activeLayer.children.find(
    (item) =>
      item instanceof paper.Group &&
      item.children.some((piece) => piece.data.id === id)
  ) as PiecesGroup
  const group = pieces.children.find((piece) => piece.data.id === id)!
  const path = group.children.display
  const base = new paper.CompoundPath({ pathData: puzzle.path, insert: false })
  const scale = target.bounds.width / base.bounds.width
  base.remove()
  const all = candidate.tans.flatMap((tan) => tan.getPoints())
  const minX = Math.min(...all.map((point) => point.toFloatX()))
  const minY = Math.min(...all.map((point) => point.toFloatY()))
  const points = candidate.tans[ids.indexOf(id)]
    .getPoints()
    .map(
      (point) =>
        new paper.Point(
          (((point.toFloatX() - minX) * 50) / 6) * scale + target.bounds.left,
          (((point.toFloatY() - minY) * 50) / 6) * scale + target.bounds.top
        )
    )
  let position = path.segments
    .reduce((sum, { point }) => sum.add(point), new paper.Point(0, 0))
    .divide(path.segments.length)
  const hit = (point: paper.Point) =>
    paper.project.hitTest(point, { fill: true, stroke: true, tolerance: 0 })
      ?.item.parent === group
  if (!hit(position)) {
    const points = path.segments.map(({ point }) => point)
    const found = points
      .flatMap((point) =>
        [0.2, 0.4, 0.6, 0.8].map((fraction) =>
          point.multiply(fraction).add(position.multiply(1 - fraction))
        )
      )
      .find(hit)
    if (!found) throw new Error(`No visible grab point for ${id}`)
    position = found
  }
  const center = (points: paper.Point[]) =>
    points
      .reduce((sum, p) => sum.add(p), new paper.Point(0, 0))
      .divide(points.length)
  const delta = center(points).subtract(
    center(path.segments.map(({ point }) => point))
  )
  const rect = paper.view.element.getBoundingClientRect()
  return {
    x: position.x + rect.left,
    y: position.y + rect.top,
    toX: position.x + delta.x + rect.left,
    toY: position.y + delta.y + rect.top,
    aligned: equalShape(
      path.segments.map(({ point }) => point),
      points
    ),
    points: path.segments.map(({ point }) => [point.x, point.y]),
    wanted: points.map((point) => [point.x, point.y]),
  }
}
