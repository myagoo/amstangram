import React from "react"
import { FiPlay, FiSquare } from "react-icons/fi"
import { Button } from "../components/button"
import { View } from "../components/view"
import {
  VICTORY_EMOJI_DURATION,
  FADEIN_TRANSITION_DURATION,
} from "../constants"
import { useKeyframes } from "css-system"

export const Victory = ({ emoji, onStop, onNext }) => {
  const spin = useKeyframes({
    0: {
      opacity: "0",
      fontSize: "0",
      transform: "rotate(0)",
    },
    33: {
      opacity: 1,
      fontSize: "30vmin",
      transform: "rotate(3645deg)",
    },
    66: {
      opacity: 1,
      fontSize: "30vmin",
      transform: "rotate(3600deg)",
    },
    100: {
      opacity: 0,
      fontSize: "30vmin",
      transform: "rotate(3600deg)",
    },
  })

  return (
    <View
      css={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
      }}
    >
      <View
        css={{
          animation: `${VICTORY_EMOJI_DURATION}ms ${spin} cubic-bezier(0, 0.8, 0.2, 1) forwards`,
        }}
      >
        {emoji}
      </View>
      <View
        css={{
          flexDirection: "row",
          gap: 3,
          animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${VICTORY_EMOJI_DURATION /
            2}ms ease both`,
        }}
      >
        <Button onClick={onStop}>
          <View as={FiSquare} css={{ m: "auto" }}></View>
        </Button>
        {onNext && (
          <Button onClick={onNext}>
            <View as={FiPlay} css={{ m: "auto" }}></View>
          </Button>
        )}
      </View>
    </View>
  )
}
