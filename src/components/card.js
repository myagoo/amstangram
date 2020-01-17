import React from "react"
import styled from "styled-components"
import { ReactComponent as Logo } from "../logo.svg"
import { View } from "./view"

const Card = styled(View).attrs({
  borderRadius: 5,
  boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
})``

Card.defaultProps = {
  width: 200,
  height: 275,
}

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
    <Card
      background="#fff"
      p={2}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      textAlign="center"
      position="relative"
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
      <View
        position="absolute"
        top={0}
        right="-10px"
        background={color}
        color="#fff"
        borderRadius={10}
        px={1}
        py="4px"
        style={{
          transform: "translateY(-50%)",
        }}
      >
        {difficulty}
      </View>
    </Card>
  )
}

export const CardRecto = props => {
  return (
    <Card
      background="#10ac84"
      border={`10px solid #fff`}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      {...props}
    >
      <Logo />
    </Card>
  )
}
