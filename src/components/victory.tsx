import { useContext, useMemo } from "react"
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
  nextLoading = false,
  nextFailed = false,
  onApprove,
  onStarToggle,
}: {
  tangram: import("../types").Tangram
  onStop(): void
  onNext?: () => void
  nextLoading?: boolean
  nextFailed?: boolean
  onApprove?: () => void
  onStarToggle?: () => void
}) => {
  const intl = useIntl()
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

  return (
    <View
      css={{
        position: "absolute",
        left: "0",
        right: "0",
        bottom: "3",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <View
        css={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "2",
          p: "2",
          maxWidth: "calc(100% - 32px)",
          bg: "dialogBackground",
          borderRadius: "3",
          boxShadow: "0 4px 20px #00000030",
          pointerEvents: "auto",
        }}
      >
        <View
          css={{
            fontSize: "40px",
            lineHeight: 1,
            p: "2",
            animation: "450ms victoryPop ease-out",
            _motionReduce: { animation: "none" },
          }}
        >
          {tangram.emoji}
        </View>
        <View
          css={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "2",
            "& > button": {
              animation: "none",
              bg: "pieces.lt2",
              boxShadow: "none",
            },
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
              disabled={nextLoading}
              aria-busy={nextLoading}
              aria-live="polite"
              css={{
                display: "flex",
                boxShadow: "0px 5px 10px #00000080",
                flexDirection: "row",
                gap: "2",
                alignItems: "flex-end",
              }}
            >
              <View as={FiPlay} css={{ boxSize: "icon" }}></View>
              <Text>
                {intl.formatMessage({
                  id: nextLoading
                    ? "Generating…"
                    : nextFailed
                      ? "Retry"
                      : "Next",
                })}
              </Text>
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
        {nextFailed && (
          <p role="alert">
            {intl.formatMessage({ id: "Generation failed. Please try again." })}
          </p>
        )}
      </View>
    </View>
  )
}
