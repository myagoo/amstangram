import paper from "paper/dist/paper-core"
import { generateTangrams } from "../../vendor/tangram-generator/generator"
import type { Tangram as EngineTangram } from "../../vendor/tangram-generator/tangram"
import { computeOutline } from "../../vendor/tangram-generator/tan"
import { SMALL_TRIANGLE_BASE } from "../constants"
import type { Tangram } from "../types"
import { createRandom } from "../utils/createRandom"
import { MIN_GENERATED_EDGES, MAX_GENERATED_EDGES } from "./settings"

// The generator's small tan has legs 6√2; the game's has legs base√2.
export function convertTangram(candidate: EngineTangram): Tangram | null {
  // Upstream evaluation sorts candidate.outline[0] in place for its convex hull.
  // Recompute the ordered boundary from the tans, without running evaluation again.
  const rings = computeOutline(candidate.tans, true)
  if (!rings) return null
  const scale = SMALL_TRIANGLE_BASE / 6
  const outline = new paper.CompoundPath({
    children: rings.map(
      (ring) =>
        new paper.Path({
          segments: ring.map((point) => [
            point.toFloatX() * scale,
            point.toFloatY() * scale,
          ]),
          closed: true,
          insert: false,
        })
    ),
    insert: false,
    fillRule: "evenodd",
  })
  try {
    outline.reorient(false, true)
    // Reject overlaps or lost components; all seven tans must cover the target.
    if (Math.abs(Math.abs(outline.area) - 16 * SMALL_TRIANGLE_BASE ** 2) > 0.01)
      return null
    outline.position = new paper.Point(
      outline.bounds.width / 2,
      outline.bounds.height / 2
    )
    return {
      path: outline.pathData,
      edges: outline.curves.length,
      width: Math.round(outline.bounds.width),
      height: Math.round(outline.bounds.height),
      length: Math.round(outline.length),
      emoji: "🎲",
    }
  } finally {
    outline.remove()
  }
}

export function generatePuzzle(edges: number, seed: string): Tangram {
  if (
    !Number.isInteger(edges) ||
    edges < MIN_GENERATED_EDGES ||
    edges > MAX_GENERATED_EDGES
  ) {
    throw new RangeError("Invalid generation difficulty")
  }
  const random = createRandom(seed)
  // ponytail: exact-match rejection search; tune the engine if extreme levels are too slow.
  for (;;) {
    const candidate = generateTangrams(1, undefined, random)[0]
    if (
      candidate.outline?.reduce((sum, ring) => sum + ring.length, 0) !== edges
    )
      continue
    const puzzle = convertTangram(candidate)
    if (puzzle?.edges === edges) return puzzle
  }
}
