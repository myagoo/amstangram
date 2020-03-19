import React from "react"
import { View } from "./view"

export const CardVerso = ({ svg, difficulty, ...props }) => {
  const color =
    difficulty === "Easy"
      ? "#10ac84"
      : difficulty === "Medium"
      ? "#2e86de"
      : difficulty === "Hard"
      ? "#ee5253"
      : "gray"
  return (
    <View
      css={{
        borderRadius: 5,
        boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        background: "#fff",
        p: 2,
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        width: 128,
        height: 178,
      }}
      {...props}
    >
      <View
        css={{
          flex: "1",
          justifyContent: "center",
          "& > *": {
            width: "100%",
          },
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <View
        css={{
          background: color,
          color: "#fff",
          borderRadius: 10,
          px: 1,
          py: "4px",
        }}
      >
        {difficulty}
      </View>
    </View>
  )
}
