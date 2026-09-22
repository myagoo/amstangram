import { useEffect, useState } from "react"
import type { Tangram } from "../types"
import { requestPuzzle } from "./requestPuzzle"

export function useNextGeneratedTangram(current: Tangram | undefined) {
  const [result, setResult] = useState<{
    current: Tangram
    puzzle: Tangram | null
  } | null>(null)
  const [attempt, setAttempt] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: An explicit retry starts a new worker for the same puzzle.
  useEffect(() => {
    // Only generated playlist entries lack a community ID.
    if (!current || current.id) return
    try {
      return requestPuzzle(current.edges, (puzzle) =>
        setResult({ current, puzzle })
      )
    } catch {
      setResult({ current, puzzle: null })
    }
  }, [current, attempt])

  const puzzle = result?.current === current ? result?.puzzle : undefined
  return {
    next: puzzle ?? undefined,
    failed: puzzle === null,
    retry: () => {
      setResult(null)
      setAttempt((value) => value + 1)
    },
  }
}
