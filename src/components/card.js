import React from "react"
import { View } from "./view"

export const Card = ({
  svg,
  difficulty,
  completedEmoji,
  selected,
  ...props
}) => {
  const color =
    difficulty === 0
      ? "#10ac84"
      : difficulty === 1
      ? "#2e86de"
      : difficulty === 2
      ? "#ee5253"
      : "gray"
  return (
    <View
      css={{
        borderRadius: 5,
        boxShadow: selected
          ? `0px 0px 0px 4px ${color}`
          : "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        background: "#fff",
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
        css={{
          flex: "1",
          justifyContent: "center",
          "& > *": {
            width: "100%",
            fill: color,
          },
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {completedEmoji && (
        <View css={{ position: "absolute", top: 2, left: 2, fontSize: "30px" }}>
          {completedEmoji}
        </View>
      )}
    </View>
  )
}
