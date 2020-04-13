import { useKeyframes } from "css-system"
import React, { useContext, useState } from "react"
import { FiCheck, FiPlay, FiSquare } from "react-icons/fi"
import { Button } from "../components/button"
import { View } from "../components/view"
import { FADE_TRANSITION_DURATION } from "../constants"
import { SoundContext } from "../contexts/sound"

export const Victory = ({ emoji, onStop, onNext, onApprove, onClap }) => {
  const [clapCount, setClapCount] = useState(false)

  const [emojiSpinEnded, setEmojiSpinEnded] = useState(false)
  const [emojiFadeOutEnded, setEmojiFadeOutEnded] = useState(false)
  const [clapFadeInEnded, setClapFadeInEnded] = useState(false)

  const [playbackRate, setPlaybackRate] = useState(1)
  const { playClap } = useContext(SoundContext)

  const emojiSpin = useKeyframes({
    0: {
      opacity: "0",
      transform: "rotate(0) scale(0)",
    },
    100: {
      opacity: 1,
      transform: `rotate(${360 * 5}deg) scale(1)`,
    },
  })

  const clap = useKeyframes({
    0: {
      transform: "rotate(0) scale(1)",
    },
    50: {
      transform: "rotate(5deg) scale(1.1)",
    },
    100: {
      transform: "rotate(0) scale(1)",
    },
  })

  const handleEmojiSpinAnimationEnd = () => {
    setTimeout(() => setEmojiSpinEnded(true), 1000)
  }

  const handleEmojiFadeOutAnimationEnd = () => {
    setEmojiFadeOutEnded(true)
  }

  const handleClapFadeInAnimationEnd = () => {
    setClapFadeInEnded(true)
  }

  const handleClapClick = () => {
    if (clapCount < 10) {
      playClap({
        playbackRate,
      })
      setClapCount(clapCount + 1)
      setPlaybackRate(playbackRate + 0.01)
      onClap()
    }
  }

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
      {!emojiSpinEnded ? (
        <View
          key="emojiSpin"
          onAnimationEnd={handleEmojiSpinAnimationEnd}
          css={{
            fontSize: "30vmin",
            animation: `2000ms ${emojiSpin} cubic-bezier(.6,1.56,.58,.92) forwards`,
          }}
        >
          {emoji}
        </View>
      ) : !emojiFadeOutEnded ? (
        <View
          key="emojiFadeOut"
          onAnimationEnd={handleEmojiFadeOutAnimationEnd}
          css={{
            fontSize: "30vmin",
            animation: `${FADE_TRANSITION_DURATION}ms ${emojiSpin} cubic-bezier(.6,1.56,.58,.92) forwards reverse`,
          }}
        >
          {emoji}
        </View>
      ) : (
        <>
          {!clapFadeInEnded ? (
            <View
              key="clapFadeInEnded"
              css={{
                fontSize: "30vmin",
                animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease both`,
              }}
              onAnimationEnd={handleClapFadeInAnimationEnd}
            >
              {"👏"}
            </View>
          ) : (
            <View
              key={`clap${clapCount}`}
              css={{
                fontSize: `30vmin`,
                animation: clapCount ? `250ms ${clap} alternate` : undefined,
              }}
              onClick={handleClapClick}
            >
              {"👏"}
            </View>
          )}
          <View
            css={{
              flexDirection: "row",
              gap: 3,
              animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease both`,
            }}
          >
            {onApprove && (
              <Button onClick={onApprove}>
                <View as={FiCheck} css={{ m: "auto" }}></View>
              </Button>
            )}
            {onNext ? (
              <Button onClick={onNext}>
                <View as={FiPlay} css={{ m: "auto" }}></View>
              </Button>
            ) : (
              <Button onClick={onStop}>
                <View as={FiSquare} css={{ m: "auto" }}></View>
              </Button>
            )}
          </View>
        </>
      )}
    </View>
  )
}
