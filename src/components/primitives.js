import React from "react"

import { Text } from "./text"
import { extendPrimitive, createPrimitive, useKeyframes } from "css-system"
import { FiStar } from "react-icons/fi"
import { View } from "./view"

export const Error = extendPrimitive(Text, {
  css: {
    fontSize: 2,
    color: "errorText",
  },
})

export const Hint = extendPrimitive(Text, {
  css: {
    fontSize: 2,
    opacity: 0.75,
  },
})

export const Title = extendPrimitive(Text, {
  css: {
    fontSize: 4,
    fontWeight: "bold",
  },
})

export const SubTitle = extendPrimitive(Text, {
  css: {
    fontSize: 3,
    fontWeight: "bold",
  },
})

export const Link = createPrimitive("a", {
  css: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "inherit",
    "&:visited": {
      color: "inherit",
    },
  },
})

export const Similink = extendPrimitive(Text, {
  css: {
    cursor: "pointer",
    textDecoration: "underline",
  },
})

export const InlineIcon = ({ icon, css }) => {
  return (
    <Text
      as={icon}
      css={{
        position: "relative",
        top: "0.1em",
        size: "0.9em",
        ...css,
      }}
    ></Text>
  )
}

export const InlineStarIcon = ({ css }) => {
  const gradient = useKeyframes({
    0: { color: "pieces.lt2" },
    14: { color: "pieces.rh" },
    28: { color: "pieces.st2" },
    42: { color: "pieces.mt1" },
    57: { color: "pieces.st1" },
    71: { color: "pieces.lt1" },
    85: { color: "pieces.sq" },
    100: { color: "pieces.lt2" },
  })
  return (
    <Text
      as={FiStar}
      css={{
        stroke: "currentColor",
        fill: "currentColor",
        animation: `${gradient} 20s linear infinite both`,
        position: "relative",
        top: "0.1em",
        size: "0.9em",
        ...css,
      }}
    ></Text>
  )
}

export const StarIcon = ({ css, deps }) => {
  const gradient = useKeyframes({
    0: { color: "pieces.lt2" },
    14: { color: "pieces.rh" },
    28: { color: "pieces.st2" },
    42: { color: "pieces.mt1" },
    57: { color: "pieces.st1" },
    71: { color: "pieces.lt1" },
    85: { color: "pieces.sq" },
    100: { color: "pieces.lt2" },
  })
  return (
    <View
      as={FiStar}
      css={{
        size: "icon",
        m: "-2px",
        stroke: "currentColor",
        fill: "currentColor",
        animation: `${gradient} 20s linear infinite both`,
        ...css,
      }}
      deps={deps}
    ></View>
  )
}
