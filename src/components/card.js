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
            fill: color,
          },
        }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <View
        css={{
          position: "absolute",
          top: 0,
          right: "-10px",
          background: color,
          color: "#fff",
          borderRadius: 10,
          px: 1,
          py: "4px",
          transform: "translateY(-50%)",
        }}
      >
        {difficulty}
      </View>
    </View>
  )
}
