import React, { useContext } from "react"
import { View } from "./view"
import { DEV, COLOR_TRANSITION_DURATION } from "../constants"
import { ThemeContext } from "css-system"
import { Badge } from "./badge"
import { SoundContext } from "../contexts/sound"
import cardSFX from "../sounds/card.wav"
import useSound from "use-sound"

export const Card = ({
  tangram: { difficulty, path, width, height, uid, approved },
  completedEmoji,
  selected,
  css,
  onBadgeClick,
  onClick,
  ...props
}) => {
  const [soundEnabled] = useContext(SoundContext)
  const [play] = useSound(cardSFX, {
    soundEnabled,
  })
  const theme = useContext(ThemeContext)
  const color = theme.colors.difficulties[difficulty]

  return (
    <View
      css={{
        opacity: uid && approved === false ? 0.5 : 1,
        borderRadius: 5,
        boxShadow: selected
          ? `0px 0px 0px 4px ${color}`
          : "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
        m: 1,
        bg: "background",
        transition: `background-color ${COLOR_TRANSITION_DURATION}ms`,
        p: 3,
        textAlign: "center",
        position: "relative",
        cursor: "pointer",
        width: 128,
        height: 178,
        ...css,
      }}
      deps={[color, selected, uid, approved]}
      onClick={
        onClick
          ? (e) => {
              play()
              onClick(e)
            }
          : undefined
      }
      {...props}
    >
      <View
        as="svg"
        css={{
          flex: "1",
          justifyContent: "center",
          fill: color,
          stroke: DEV ? "red" : undefined,
          strokeWidth: DEV ? 4 : undefined,
        }}
        deps={[color]}
        viewBox={`0 0 ${width} ${height}`}
        dangerouslySetInnerHTML={{ __html: `<path d="${path}" />` }}
      />
      {completedEmoji && (
        <View css={{ position: "absolute", top: 2, left: 2, fontSize: "30px" }}>
          {completedEmoji}
        </View>
      )}
      {uid && (
        <Badge
          uid={uid}
          css={{
            position: "absolute",
            bottom: 1,
            right: 1,
          }}
          onClick={
            onBadgeClick
              ? (e) => {
                  e.stopPropagation()
                  onBadgeClick(uid)
                }
              : undefined
          }
        ></Badge>
      )}
    </View>
  )
}
