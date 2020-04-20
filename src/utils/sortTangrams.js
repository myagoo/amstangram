import { DIGITS, LETTERS } from "../constants"

export const sortTangrams = (tangramA, tangramB) => {
  return tangramB.edges === tangramA.edges
    ? tangramB.length - tangramA.length
    : tangramB.edges - tangramA.edges
}

export const sortDigitsTangrams = (tangramA, tangramB) => {
  return DIGITS.indexOf(tangramA.emoji) - DIGITS.indexOf(tangramB.emoji)
}

export const sortLettersTangrams = (tangramA, tangramB) => {
  return LETTERS.indexOf(tangramA.emoji) - LETTERS.indexOf(tangramB.emoji)
}
