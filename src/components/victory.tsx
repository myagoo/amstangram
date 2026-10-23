import React, { useContext, useState, useMemo, useEffect, useRef } from "react"
import { FiCheck, FiPlay, FiX, FiStar } from "react-icons/fi"
import { useIntl } from "react-intl"
import { PrimaryButton } from "./button"
import { View } from "./view"
import { SoundContext } from "../contexts/sound"
import { Text } from "./text"
import { GalleryContext } from "../contexts/gallery"

export const Victory = ({
  tangram,
  onStop,
  onNext,
  onApprove,
  onStarToggle,
}: {
  tangram: import("../types").Tangram
  onStop(): void
  onNext?: () => void
  onApprove?: () => void
  onStarToggle?: () => void
}) => {
  const intl = useIntl()
  const [emojiSpinEnded, setEmojiSpinEnded] = useState(false)
  const spinTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  useEffect(() => () => clearTimeout(spinTimeout.current), [])
  const { playStar } = useContext(SoundContext)
  const { tangramsStarredBy, isTangramStarred } = useContext(GalleryContext)

  const stars = useMemo(() => {
    let stars = 0
    if (!tangram.id) return stars
    for (const starredByUid in tangramsStarredBy![tangram.id]) {
      if (tangramsStarredBy![tangram.id][starredByUid]) {
        stars += 1
      }
    }
    return stars
  }, [tangram, tangramsStarredBy])

  const starred = tangram.id ? isTangramStarred(tangram.id) : false

  const handleEmojiSpinAnimationEnd = () => {
    clearTimeout(spinTimeout.current)
    spinTimeout.current = setTimeout(() => setEmojiSpinEnded(true), 1000)
  }

  return (
    <View
      css={{
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        alignItems: "center",
        justifyContent: "center",
        gap: "3",
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
            animation: `2000ms emojiSpin cubic-bezier(.6,1.56,.58,.92) forwards`,
          }}
        >
          {tangram.emoji}
        </View>
        {emojiSpinEnded && (
          <View
            css={{
              mt: "3",
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              flexDirection: "row",
              gap: "3",
              animation: "{durations.fade} fadeIn ease both",
            }}
          >
            {onApprove && (
              <PrimaryButton
                onClick={onApprove}
                css={{
                  display: "flex",
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: "2",
                  alignItems: "flex-end",
                }}
              >
                <View as={FiCheck} css={{ boxSize: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Approve" })}</Text>
              </PrimaryButton>
            )}
            {onStarToggle && (
              <PrimaryButton
                mute
                onClick={() => {
                  playStar()
                  onStarToggle()
                }}
                css={{
                  display: "flex",
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: "2",
                  alignItems: "flex-end",
                }}
              >
                <Text>{stars}</Text>
                <View
                  as={FiStar}
                  css={{
                    boxSize: "icon",
                    fill: starred ? "currentColor" : undefined,
                  }}
                ></View>
              </PrimaryButton>
            )}
            {onNext ? (
              <PrimaryButton
                onClick={onNext}
                css={{
                  display: "flex",
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: "2",
                  alignItems: "flex-end",
                }}
              >
                <View as={FiPlay} css={{ boxSize: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Next" })}</Text>
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={onStop}
                css={{
                  display: "flex",
                  boxShadow: "0px 5px 10px #00000080",
                  flexDirection: "row",
                  gap: "2",
                  alignItems: "flex-end",
                }}
              >
                <View as={FiX} css={{ boxSize: "icon" }}></View>
                <Text>{intl.formatMessage({ id: "Quit" })}</Text>
              </PrimaryButton>
            )}
          </View>
        )}
      </View>
    </View>
  )
}
