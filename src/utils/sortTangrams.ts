import { DIGITS, LETTERS } from "../constants"

export const sortTangrams = (tangramA: import("../types").SavedTangram, tangramB: import("../types").SavedTangram) => {
  return tangramB.edges === tangramA.edges
    ? tangramB.length - tangramA.length
    : tangramB.edges - tangramA.edges
}

export const sortDigitsTangrams = (tangramA: import("../types").SavedTangram, tangramB: import("../types").SavedTangram) => {
  return DIGITS.indexOf(tangramA.emoji) - DIGITS.indexOf(tangramB.emoji)
}

export const sortLettersTangrams = (tangramA: import("../types").SavedTangram, tangramB: import("../types").SavedTangram) => {
  return LETTERS.indexOf(tangramA.emoji) - LETTERS.indexOf(tangramB.emoji)
}
