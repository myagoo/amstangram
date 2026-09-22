import React from "react"

import { Text } from "./text"
import { styled } from "../../styled-system/jsx"
import { FiStar } from "react-icons/fi"
import { View } from "./view"

export const ErrorText = styled(Text, {
  base: {
    fontSize: "2",
    color: "errorText",
  },
})

export const Hint = styled(Text, {
  base: {
    fontSize: "2",
    opacity: 0.75,
  },
})

export const Title = styled(Text, {
  base: {
    fontSize: "4",
    fontWeight: "bolder",
  },
})

export const SubTitle = styled(Text, {
  base: {
    fontSize: "3",
    fontWeight: "bold",
  },
})

export const Link = styled("a", {
  base: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "inherit",
    "&:visited": {
      color: "inherit",
    },
  },
})

export const Similink = styled(Text, {
  base: {
    cursor: "pointer",
    textDecoration: "underline",
  },
})

export const InlineIcon = ({
  icon,
  css,
}: import("../utils/styles").StyleProps & {
  icon: import("react-icons").IconType
}) => {
  return (
    <Text
      as={icon}
      css={{
        position: "relative",
        top: "0.1em",
        boxSize: "0.9em",
        ...css,
      }}
    ></Text>
  )
}

export const InlineStarIcon = ({
  css,
}: import("../utils/styles").StyleProps) => {
  return (
    <Text
      as={FiStar}
      css={{
        stroke: "currentColor",
        fill: "currentColor",
        animation: "pieceColor 20s linear infinite both",
        position: "relative",
        top: "0.1em",
        boxSize: "0.9em",
        ...css,
      }}
    ></Text>
  )
}

export const StarIcon = ({ css }: import("../utils/styles").StyleProps) => {
  return (
    <View
      as={FiStar}
      css={{
        boxSize: "icon",
        m: "-2px",
        stroke: "currentColor",
        fill: "currentColor",
        animation: "pieceColor 20s linear infinite both",
        ...css,
      }}
    ></View>
  )
}
