import { useContext, useEffect, useRef, useState } from "react"
import { useIntl } from "react-intl"
import { GalleryContext } from "../contexts/gallery"
import {
  MIN_GENERATED_EDGES,
  MAX_GENERATED_EDGES,
} from "../generation/settings"
import { requestPuzzle } from "../generation/requestPuzzle"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { ThemeContext } from "../utils/styles"
import { PrimaryButton } from "./button"
import { styled } from "../../styled-system/jsx"
import { Dialog } from "./dialog"
import { Title } from "./primitives"
import { View } from "./view"

const thumb = {
  width: "20px",
  height: "20px",
  borderRadius: "99999px",
  bg: "dialogText",
  border: "none",
  boxShadow: "0 0 0 2px {colors.inputBackground}",
} as const
const track = {
  height: "20px",
  borderRadius: "99999px",
  bg: "currentColor",
} as const
const DifficultySlider = styled("input", {
  base: {
    appearance: "none",
    width: "100%",
    height: "44px",
    flexShrink: 0,
    background: "transparent",
    cursor: "pointer",
    margin: 0,
    "&::-webkit-slider-runnable-track": track,
    "&::-moz-range-track": track,
    "&::-webkit-slider-thumb": { ...thumb, appearance: "none" },
    "&::-moz-range-thumb": thumb,
    "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
    "&:focus-visible": {
      outline: "2px solid {colors.dialogText}",
      outlineOffset: "2px",
      borderRadius: "2",
    },
  },
})

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
  const [difficulty, setDifficulty] = useState(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem("generationDifficulty") ?? "null"
      )
      if (
        typeof saved === "number" &&
        Number.isInteger(saved) &&
        saved >= 0 &&
        saved <= MAX_GENERATED_EDGES - MIN_GENERATED_EDGES
      )
        return saved
    } catch {
      // Storage is optional; keep the default if unavailable or malformed.
    }
    return 8
  })
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const cancelRef = useRef<(() => void) | null>(null)
  const edges = MAX_GENERATED_EDGES - difficulty

  const cancel = () => {
    cancelRef.current?.()
    cancelRef.current = null
    onClose()
  }

  useEffect(
    () => () => {
      cancelRef.current?.()
      cancelRef.current = null
    },
    []
  )

  useEffect(() => {
    try {
      localStorage.setItem("generationDifficulty", JSON.stringify(difficulty))
    } catch {
      // An unavailable store must not prevent generation.
    }
  }, [difficulty])

  const start = () => {
    if (cancelRef.current) return
    setLoading(true)
    setFailed(false)
    const fail = () => {
      cancelRef.current = null
      setLoading(false)
      setFailed(true)
    }
    try {
      cancelRef.current = requestPuzzle(edges, (puzzle) => {
        cancelRef.current = null
        if (!puzzle) {
          fail()
          return
        }
        setPlaylist([puzzle])
        onStart()
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
      <DifficultySlider
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
          color: theme.colors.difficulties[getTangramDifficulty({ edges })],
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
    </Dialog>
  )
}
