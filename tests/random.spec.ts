import { test, expect } from "@playwright/test"
import { createRandom } from "../src/utils/createRandom"
import { shuffle } from "../src/utils/shuffle"
import { getRandomEmoji } from "../src/utils/getRandomEmoji"

test("test workers run under Bun rather than silently falling back to Node", () => {
  expect(process.versions.bun).toBeTruthy()
})

test("seeded streams preserve the recorded sequence and validate URL seeds", () => {
  expect(Array.from({ length: 3 }, createRandom("42"))).toEqual([
    0.2523451747838408, 0.08812504541128874, 0.5772811982315034,
  ])
  expect(createRandom("0")()).toBe(0.23606797284446657)
  for (const seed of ["0", "4294967295"]) {
    expect(Array.from({ length: 1000 }, createRandom(seed)).every(value => value >= 0 && value < 1)).toBe(true)
  }
  for (const seed of [null, "", "-1", "1.5", "Infinity", "NaN", "4294967296", "42oops", " 42"]) {
    expect(createRandom(seed)).toBe(Math.random)
  }
})

test("unit callers can replay shuffles and emojis using isolated streams", () => {
  const sample = () => {
    const random = createRandom("42")
    return { playlist: shuffle([1, 2, 3, 4, 5, 6, 7], random), emoji: getRandomEmoji(random) }
  }
  const first = sample()
  shuffle([1, 2, 3], createRandom("99"))
  expect(sample()).toEqual(first)
  expect([...first.playlist].sort()).toEqual([1, 2, 3, 4, 5, 6, 7])
})
