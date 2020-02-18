import React from "react"
import { View } from "./view"

export const CardVerso = ({ tangram, ...props }) => {
  const difficulty =
    tangram.percent > 50 ? "Easy" : tangram.percent > 20 ? "Medium" : "Hard"
  const color =
    difficulty === "Easy"
      ? "#10ac84"
      : difficulty === "Medium"
      ? "#2e86de"
      : "#ee5253"
  return (
    <View
      css={{
        borderRadius: 5,
        boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        background: "#fff",
        p: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        width: 128,
        height: 178,
      }}
      {...props}
    >
      <View
        as="svg"
        css={{
          flex: "1",
        }}
        alt=""
        viewBox={`0 0 ${tangram.width} ${tangram.height}`}
        dangerouslySetInnerHTML={{ __html: tangram.svg }}
        fill={color}
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
