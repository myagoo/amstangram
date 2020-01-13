import React from "react"
import { View } from "./view"

export const Card = ({ tangram, ...props }) => {
  const difficulty =
    tangram.percent > 50 ? "Easy" : tangram.percent > 20 ? "Medium" : "Hard"
  const color =
    difficulty === "Easy" ? "green" : difficulty === "Medium" ? "blue" : "red"
  return (
    <View
      background="#FFF"
      borderRadius={5}
      p={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      textAlign="center"
      border="5px solid #fff"
      width={128}
      height={178}
      style={{
        boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
      }}
      {...props}
    >
      <View
        as="svg"
        flex="1"
        alt=""
        viewBox={`0 0 ${tangram.width} ${tangram.height}`}
        dangerouslySetInnerHTML={{ __html: tangram.svg }}
        fill={color}
      />
      <View mt={2} fontFamily="Sail" fontSize="32px" color={color}>
        {difficulty}
      </View>
    </View>
  )
}
