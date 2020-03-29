import React, { useContext } from "react"
import { View } from "./view"
import { DEV, COLOR_TRANSITION_DURATION } from "../constants"
import { ThemeContext } from "css-system"

export const Card = ({
  tangram: { parent, difficulty, path, width, height },
  completedEmoji,
  selected,
  ...props
}) => {
  const theme = useContext(ThemeContext)
  const color = theme.colors.difficulties[difficulty]
  return (
    <View
      css={{
        borderRadius: 5,
        boxShadow: selected
          ? `0px 0px 0px 4px ${color}`
          : "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        bg: "background",
        transition: `background-color ${COLOR_TRANSITION_DURATION}ms`,
        p: 3,
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        width: 128,
        height: 178,
      }}
      deps={[selected]}
      {...props}
    >
      <View
        as="svg"
        css={{
          flex: "1",
          justifyContent: "center",
          width: "100%",
          fill: color,
          stroke: DEV ? "red" : undefined,
          strokeWidth: DEV ? 4 : undefined,
        }}
        viewBox={`0 0 ${width} ${height}`}
        dangerouslySetInnerHTML={{ __html: `<path d="${path}" />` }}
      />
      {completedEmoji && (
        <View css={{ position: "absolute", top: 2, left: 2, fontSize: "30px" }}>
          {completedEmoji}
        </View>
      )}
      {DEV && parent.name}
    </View>
  )
}
