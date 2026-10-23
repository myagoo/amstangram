import { useContext, useEffect, useRef, useState } from "react"
import { useIntl } from "react-intl"
import { GalleryContext } from "../contexts/gallery"
import {
  MIN_GENERATED_EDGES,
  MAX_GENERATED_EDGES,
} from "../generation/settings"
import type { Tangram } from "../types"
import { createGameRandom } from "../utils/createRandom"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { ThemeContext } from "../utils/styles"
import { PrimaryButton, SecondaryButton } from "./button"
import { Dialog } from "./dialog"
import { Title } from "./primitives"
import { View } from "./view"

const random = createGameRandom()

export const GenerationDialog = ({
  onClose,
  onStart,
}: {
  onClose(): void
  onStart(): void
}) => {
  const intl = useIntl()
  const theme = useContext(ThemeContext)
  const { setPlaylist } = useContext(GalleryContext)
  const [difficulty, setDifficulty] = useState(8)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const edges = MAX_GENERATED_EDGES - difficulty

  const cancel = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    onClose()
  }

  useEffect(
    () => () => {
      workerRef.current?.terminate()
      workerRef.current = null
    },
    []
  )

  const start = () => {
    if (workerRef.current) return
    setLoading(true)
    setFailed(false)
    const fail = () => {
      workerRef.current?.terminate()
      workerRef.current = null
      setLoading(false)
      setFailed(true)
    }
    try {
      const worker = new Worker(
        new URL("../generation/generate.worker.ts", import.meta.url),
        { type: "module" }
      )
      workerRef.current = worker
      worker.onmessage = (
        event: MessageEvent<{ puzzle?: Tangram; error?: boolean }>
      ) => {
        if (workerRef.current !== worker) return
        if (!event.data.puzzle || event.data.puzzle.edges !== edges) {
          fail()
          return
        }
        worker.terminate()
        workerRef.current = null
        setPlaylist([event.data.puzzle])
        onStart()
      }
      worker.onerror = (event) => {
        event.preventDefault()
        if (workerRef.current === worker) fail()
      }
      worker.onmessageerror = () => {
        if (workerRef.current === worker) fail()
      }
      worker.postMessage({
        edges,
        seed: String(Math.floor(random() * 4294967296)),
      })
    } catch {
      fail()
    }
  }

  return (
    <Dialog
      onClose={cancel}
      title={<Title>{intl.formatMessage({ id: "Random tangram" })}</Title>}
      css={{ gap: "3" }}
    >
      <label htmlFor="generation-difficulty">
        {intl.formatMessage({ id: "Difficulty" })}
      </label>
      <input
        id="generation-difficulty"
        type="range"
        min={0}
        max={MAX_GENERATED_EDGES - MIN_GENERATED_EDGES}
        step={1}
        value={difficulty}
        disabled={loading}
        aria-valuetext={intl.formatMessage(
          { id: "Difficulty {level} of {total}" },
          {
            level: difficulty + 1,
            total: MAX_GENERATED_EDGES - MIN_GENERATED_EDGES + 1,
          }
        )}
        onChange={(event) => setDifficulty(Number(event.target.value))}
        style={{
          accentColor:
            theme.colors.difficulties[getTangramDifficulty({ edges })],
          width: "100%",
        }}
      />
      <View css={{ flexDirection: "row", justifyContent: "space-between" }}>
        <span>{intl.formatMessage({ id: "Easy" })}</span>
        <span>{intl.formatMessage({ id: "Hard" })}</span>
      </View>
      {failed && (
        <p role="alert">
          {intl.formatMessage({ id: "Generation failed. Please try again." })}
        </p>
      )}
      <PrimaryButton
        onClick={start}
        disabled={loading}
        aria-busy={loading}
        aria-live="polite"
      >
        {intl.formatMessage({ id: loading ? "Generating…" : "Start" })}
      </PrimaryButton>
      <SecondaryButton onClick={cancel}>
        {intl.formatMessage({ id: "Cancel" })}
      </SecondaryButton>
    </Dialog>
  )
}
