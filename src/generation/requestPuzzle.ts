import type { Tangram } from "../types"
import { createGameRandom } from "../utils/createRandom"

const random = createGameRandom()

// Each request owns its worker; cancelling also ignores already queued messages.
export function requestPuzzle(
  edges: number,
  onResult: (puzzle: Tangram | null) => void
) {
  const worker = new Worker(new URL("./generate.worker.ts", import.meta.url), {
    type: "module",
  })
  let active = true
  const cancel = () => {
    active = false
    worker.terminate()
  }
  const finish = (puzzle: Tangram | null) => {
    if (!active) return
    cancel()
    onResult(puzzle)
  }
  worker.onmessage = (event: MessageEvent<{ puzzle?: Tangram }>) => {
    const puzzle = event.data.puzzle
    finish(puzzle?.edges === edges ? puzzle : null)
  }
  worker.onerror = (event) => {
    event.preventDefault()
    finish(null)
  }
  worker.onmessageerror = () => finish(null)
  try {
    worker.postMessage({
      edges,
      seed: String(Math.floor(random() * 4294967296)),
    })
  } catch (error) {
    cancel()
    throw error
  }
  return cancel
}
