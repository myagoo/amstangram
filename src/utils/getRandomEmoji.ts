import { createGameRandom } from "./createRandom"

const emojiRandom = createGameRandom()
const EMOJIS = ["💪", "🔥", "😱", "😎", "🎉", "🥇", "🚀", "👌", "👍", "😵"]

export const getRandomEmoji = (random = emojiRandom) => {
  return EMOJIS[Math.floor(random() * EMOJIS.length)]
}
