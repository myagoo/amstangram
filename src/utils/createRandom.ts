// Optional unsigned 32-bit seed for reproducible tests, not security-sensitive randomness.
export const createRandom = (seed: string | null) => {
  if (seed === null || !/^\d+$/.test(seed) || Number(seed) > 0xffffffff) {
    return Math.random
  }
  let state = Number(seed)
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

// Separate streams keep unrelated UI activity from consuming gameplay randomness.
export const createGameRandom = () => createRandom(
  typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("seed")
)
