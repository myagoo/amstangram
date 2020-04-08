import { ThemeContext } from "css-system"
import React, { useContext, useMemo } from "react"
import { View } from "./view"

export const Toggle = ({
  size = 20,
  leftComponent,
  leftValue,
  rightComponent,
  rightValue,
  value,
  onChange,
}) => {
  const theme = useContext(ThemeContext)

  const selectedSide = useMemo(
    () => (value === rightValue ? "right" : "left"),
    [value, rightValue]
  )

  const toggleSelectedSide = () => {
    const newSelectedSide = selectedSide === "left" ? "right" : "left"

    onChange(newSelectedSide === "right" ? rightValue : leftValue)
  }

  const handleSideClick = (newSelectedSide) => {
    if (newSelectedSide === selectedSide) {
      return
    }
    onChange(newSelectedSide === "right" ? rightValue : leftValue)
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
      <View css={{ cursor: "pointer" }} onClick={() => handleSideClick("left")}>
        {leftComponent}
      </View>
      <View
        onClick={toggleSelectedSide}
        css={{
          cursor: "pointer",
          position: "relative",
          bg: "inputBackground",
          width: `${2 * size}px`,
          height: `${size}px`,
          borderRadius: "99999px",
        }}
      >
        <View
          css={{
            position: "absolute",
            size: `${size}px`,
            borderRadius: "99999px",
            bg: "galleryText",
            boxShadow: `0 0 0 2px ${theme.colors.inputBackground}`,
            transition: "left 250ms ease-in-out",
          }}
          style={{ left: selectedSide === "left" ? 0 : size }}
        ></View>
      </View>
      <View
        css={{ cursor: "pointer" }}
        onClick={() => handleSideClick("right")}
      >
        {rightComponent}
      </View>
    </View>
  )
}
