import { ThemeContext } from "css-system"
import React, { useContext, useMemo } from "react"
import { SoundContext } from "../contexts/sound"
import { View } from "./view"

const SIZE = 20

export const Toggle = ({
  leftComponent,
  leftValue,
  rightComponent,
  rightValue,
  value,
  onChange,
  invertSounds,
}) => {
  const { playToggle, soundEnabled } = useContext(SoundContext)

  const theme = useContext(ThemeContext)

  const selectedSide = useMemo(
    () => (value === rightValue ? "right" : "left"),
    [value, rightValue]
  )

  const play = () => {
    if (invertSounds) {
      if (!soundEnabled) {
        playToggle({
          forceSoundEnabled: true,
        })
      }
    } else {
      playToggle()
    }
  }

  const toggleSelectedSide = () => {
    const newSelectedSide = selectedSide === "left" ? "right" : "left"

    onChange(newSelectedSide === "right" ? rightValue : leftValue)
    play()
  }

  const handleSideClick = (newSelectedSide) => {
    if (newSelectedSide === selectedSide) {
      return
    }

    onChange(newSelectedSide === "right" ? rightValue : leftValue)
    play()
  }

  return (
    <View
      css={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
      }}
    >
      <View
        css={{ cursor: "pointer", flex: "1", alignItems: "flex-end" }}
        onClick={() => handleSideClick("left")}
      >
        {leftComponent}
      </View>
      <View
        onClick={toggleSelectedSide}
        css={{
          cursor: "pointer",
          position: "relative",
          bg: "inputBackground",
          width: `${2 * SIZE}px`,
          height: `${SIZE}px`,
          borderRadius: "99999px",
        }}
      >
        <View
          css={{
            position: "absolute",
            size: `${SIZE}px`,
            borderRadius: "99999px",
            bg: "dialogText",
            boxShadow: `0 0 0 2px ${theme.colors.inputBackground}`,
            transition: "left 250ms ease-in-out",
          }}
          style={{ left: selectedSide === "left" ? 0 : SIZE }}
        ></View>
      </View>
      <View
        css={{ cursor: "pointer", flex: "1", alignItems: "flex-start" }}
        onClick={() => handleSideClick("right")}
      >
        {rightComponent}
      </View>
    </View>
  )
}
