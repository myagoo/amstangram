import assert from "node:assert/strict"
import { generateTangrams } from "../vendor/tangram-generator/generator"
import { Point, relativeOrientation } from "../vendor/tangram-generator/point"
import { IntAdjoinSqrt2 } from "../vendor/tangram-generator/intadjoinsqrt2"
import { setGenerating } from "../vendor/tangram-generator/helpers"
import { createRandom } from "../src/utils/createRandom"
import { Tan, containsPoint } from "../vendor/tangram-generator/tan"
import { LineSegment } from "../vendor/tangram-generator/lineSegement"
import { SegmentDirections } from "../vendor/tangram-generator/directions"
import { createHash } from "node:crypto"
import { test } from "vitest"

test("optimized geometry preserves seeded candidates, scores and the random stream", () => {
  const random = createRandom("42")
  setGenerating(true)
  const directions = SegmentDirections.flat(3)
  const directionCode = (point: Point) =>
    3 * Math.sign(point.toFloatX()) + Math.sign(point.toFloatY())
  for (const direction of directions)
    for (const other of directions) {
      assert.equal(
        directionCode(direction) === directionCode(other),
        direction.multipleOf(other),
        "Direction lookup changed an orientation weight"
      )
    }
  for (const generating of [true, false]) {
    setGenerating(generating)
    for (let i = 0; i < 10000; i++) {
      const point = () =>
        new Point(
          new IntAdjoinSqrt2(
            Math.floor(random() * 60),
            Math.floor(random() * 12) - 6
          ),
          new IntAdjoinSqrt2(
            Math.floor(random() * 60),
            Math.floor(random() * 12) - 6
          )
        )
      const a = new LineSegment(point(), point())
      const b = new LineSegment(
        i % 3 ? point() : a.point1,
        i % 5 ? point() : a.point1.middle(a.point2)
      )
      if (i % 11 === 0) a.point2 = a.point1
      const expected =
        !(
          a.onSegmentIncludingEndpoints(b.point1) ||
          a.onSegmentIncludingEndpoints(b.point2) ||
          b.onSegmentIncludingEndpoints(a.point1) ||
          b.onSegmentIncludingEndpoints(a.point2)
        ) && a.intersectsOrientations(b)
      assert.equal(
        a.intersects(b),
        expected,
        `Segment crossing ${i}, generating ${generating}`
      )
    }
  }
  for (const generating of [true, false]) {
    setGenerating(generating)
    for (let i = 0; i < 10000; i++) {
      const coord = () =>
        new IntAdjoinSqrt2(
          Math.floor(random() * 100) - 50,
          Math.floor(random() * 100) - 50
        )
      const a = new Point(coord(), coord()),
        b = new Point(coord(), coord())
      const c = i % 2 ? new Point(coord(), coord()) : a.dup().add(b).scale(0.5)
      const determinant = a.dup().subtract(c).determinant(b.dup().subtract(c))
      const expected = determinant.isZero()
        ? 0
        : determinant.toFloat() > 0
          ? 1
          : -1
      assert.equal(relativeOrientation(a, b, c), expected)
    }
  }
  // A tan is convex: its half-plane test must agree with the original winding test,
  // including vertices, shared edges, both parallelogram mirrors and outside points.
  setGenerating(true)
  for (let type = 0; type < 6; type++)
    for (let angle = 0; angle < 8; angle++) {
      const tan = new Tan(
        type,
        new Point(new IntAdjoinSqrt2(30, 3), new IntAdjoinSqrt2(30, -3)),
        angle
      )
      const points = tan.getPoints()
      const samples = [
        ...points,
        ...tan.getInsidePoints(),
        ...points.map((p, i) => p.middle(points[(i + 1) % points.length])),
      ]
      for (let i = 0; i < 200; i++)
        samples.push(
          new Point(
            new IntAdjoinSqrt2(
              Math.floor(random() * 60),
              Math.floor(random() * 12) - 6
            ),
            new IntAdjoinSqrt2(
              Math.floor(random() * 60),
              Math.floor(random() * 12) - 6
            )
          )
        )
      for (const point of samples)
        assert.equal(
          tan.containsPoint(point),
          containsPoint(points, point),
          `Tan ${type}, orientation ${angle}`
        )
    }
  setGenerating(false)
  const scoredRandom = createRandom("42"),
    unscoredRandom = createRandom("42")
  let firstMaxDifficulty = 0
  for (let i = 0; i < 2500; i++) {
    const scored = generateTangrams(1, undefined, scoredRandom)[0]
    const unscored = generateTangrams(1, undefined, unscoredRandom, false)[0]
    assert.deepEqual(
      unscored.tans,
      scored.tans,
      "Skipping unused scores changed the generated tans"
    )
    const rings = (candidate: typeof scored) =>
      candidate.outline?.map((r) =>
        r
          .map((p) => [
            p.x.coeffInt,
            p.x.coeffSqrt,
            p.y.coeffInt,
            p.y.coeffSqrt,
          ])
          .sort()
      )
    assert.deepEqual(
      rings(unscored),
      rings(scored),
      "Skipping unused scores changed a boundary ring"
    )
    assert.equal(unscored.evaluation, undefined)
    if (
      !firstMaxDifficulty &&
      unscored.outline?.reduce((sum, ring) => sum + ring.length, 0) === 5
    )
      firstMaxDifficulty = i + 1
  }
  assert.equal(
    scoredRandom(),
    unscoredRandom(),
    "Skipping unused scores changed the random stream"
  )
  assert.equal(
    firstMaxDifficulty,
    2392,
    "The slow seed must still search the same candidate sequence"
  )
  const samples = createRandom("42"),
    begin = performance.now()
  const outlines = []
  for (let i = 0; i < 1000; i++) {
    const candidate = generateTangrams(1, undefined, samples)[0]
    outlines.push(
      candidate.tans.map((t) => [
        t.tanType,
        t.orientation,
        t.anchor.x.coeffInt,
        t.anchor.x.coeffSqrt,
        t.anchor.y.coeffInt,
        t.anchor.y.coeffSqrt,
      ])
    )
  }
  const hash = createHash("sha256")
    .update(JSON.stringify(outlines))
    .digest("hex")
  console.log(
    JSON.stringify({
      candidates: 1000,
      ms: Math.round(performance.now() - begin),
      hash,
    })
  )
  assert.equal(
    hash,
    "bda7aa6680fae5d973421ce5d0a06706b3d594e3fec92a183f9468b223aadb77"
  )
}, 30000)
