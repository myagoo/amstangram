import { useKeyframes } from "css-system"
import React, { useContext, useState, useMemo } from "react"
import { FiCheck, FiPlay, FiX, FiStar } from "react-icons/fi"
import { useIntl } from "react-intl"
import { PrimaryButton } from "../components/button"
import { View } from "../components/view"
import { FADE_TRANSITION_DURATION } from "../constants"
import { SoundContext } from "../contexts/sound"
import { Text } from "./text"
import { GalleryContext } from "../contexts/gallery"

export const Victory = ({
  tangram,
  onStop,
  onNext,
  onApprove,
  onStarToggle,
}) => {
  const intl = useIntl()
  const [emojiSpinEnded, setEmojiSpinEnded] = useState(false)
  const { playStar } = useContext(SoundContext)
  const { tangramsStarredBy, isTangramStarred } = useContext(GalleryContext)

  const stars = useMemo(() => {
    let stars = 0
    for (const starredByUid in tangramsStarredBy[tangram.id]) {
      if (tangramsStarredBy[tangram.id][starredByUid]) {
        stars += 1
      }
    }
    return stars
  }, [tangram, tangramsStarredBy])

  const starred = isTangramStarred(tangram.id)

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

  const handleEmojiSpinAnimationEnd = () => {
    setTimeout(() => setEmojiSpinEnded(true), 1000)
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
      <View
        css={{
          position: "relative",
        }}
      >
        <View
          key="emojiSpin"
          onAnimationEnd={handleEmojiSpinAnimationEnd}
          css={{
            textShadow: "0px 5px 10px #00000080",
            fontSize: "30vmin",
            animation: `2000ms ${emojiSpin} cubic-bezier(.6,1.56,.58,.92) forwards`,
          }}
        >
          {tangram.emoji}
        </View>
        {emojiSpinEnded && (
          <View
            css={{
              mt: 3,
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              flexDirection: "row",
              gap: 3,
              animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease both`,
            }}
          >
            {onApprove && (
              <View
                as={PrimaryButton}
                onClick={onApprove}
                css={{
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                <View as={FiCheck} css={{ size: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Approve" })}</Text>
              </View>
            )}
            {onStarToggle && (
              <View
                as={PrimaryButton}
                mute
                onClick={() => {
                  playStar()
                  onStarToggle()
                }}
                css={{
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                <Text>{stars}</Text>
                <View
                  as={FiStar}
                  css={{
                    size: "icon",
                    fill: starred ? "currentColor" : undefined,
                  }}
                  deps={[starred]}
                ></View>
              </View>
            )}
            {onNext ? (
              <View
                as={PrimaryButton}
                onClick={onNext}
                css={{
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                <View as={FiPlay} css={{ size: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Next" })}</Text>
              </View>
            ) : (
              <View
                as={PrimaryButton}
                onClick={onStop}
                css={{
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "flex-end",
                }}
              >
                <View as={FiX} css={{ size: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Quit" })}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
