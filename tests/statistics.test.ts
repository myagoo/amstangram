import { test, expect } from "vitest"
import {
  calculatePlayerStats,
  EMPTY_PLAYER_STATS,
} from "../src/utils/calculatePlayerStats"

test("statistics count zero-time completions but exclude star-only, self-star and unapproved activity", () => {
  expect(
    calculatePlayerStats(
      [
        { id: "star-only", uid: "maker", approved: true },
        { id: "zero", uid: "maker", approved: true },
        { id: "normal", uid: "other", approved: true },
        { id: "pending", uid: "maker", approved: false },
        { id: "draft", uid: "maker" },
      ],
      {
        "star-only": { tester: true, maker: true, other: false },
        pending: { tester: true },
      },
      {
        "star-only": { tester: undefined, maker: undefined },
        zero: { tester: 0 },
        normal: { tester: 42, other: 50 },
        pending: { tester: 123 },
        draft: { tester: 456 },
      }
    )
  ).toEqual({
    maker: { stars: 1, created: 2, completed: 0 },
    tester: { stars: 0, created: 0, completed: 2 },
    other: { stars: 0, created: 1, completed: 1 },
  })
})

test("missing activity and unknown players have zero activity", () => {
  const stats = calculatePlayerStats(
    [{ id: "empty", uid: "maker", approved: true }],
    {},
    {}
  )
  expect(stats.maker).toEqual({ stars: 0, created: 1, completed: 0 })
  expect(stats.idle ?? EMPTY_PLAYER_STATS).toEqual({
    stars: 0,
    created: 0,
    completed: 0,
  })
  expect(calculatePlayerStats([], {}, {})).toEqual({})
})
