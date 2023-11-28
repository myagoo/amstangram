import { ThemeContext } from "css-system"
import React, { useContext, useMemo, useCallback } from "react"
import { COLOR_TRANSITION_DURATION } from "../constants"
import { SoundContext } from "../contexts/sound"
import { Badge } from "./badge"
import { View } from "./view"
import { useLongPress } from "../utils/useLongPress"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"

export const Card = ({
  showStroke,
  tangram,
  completed,
  selected,
  css,
  onBadgeClick,
  onClick,
  onLongPress,
  hideBadge,
  ...props
}) => {
  const { path, width, height, uid, approved, emoji } = tangram
  const difficulty = useMemo(() => getTangramDifficulty(tangram), [tangram])
  const { playCard } = useContext(SoundContext)
  const theme = useContext(ThemeContext)
  const color = theme.colors.difficulties[difficulty]
  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress(tangram)
    }
  }, [onLongPress, tangram])
  const longPressHandlers = useLongPress(handleLongPress, 1000)

  return (
    <View
      css={css}
      onClick={
        onClick
          ? () => {
              playCard()
              onClick(tangram)
            }
          : undefined
      }
      {...longPressHandlers}
      {...props}
    >
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
          cursor: onClick || onLongPress ? "pointer" : undefined,
          width: 128,
          height: 178,
        }}
        deps={[color, selected, uid, approved]}
      >
        <View
          as="svg"
          css={{
            flex: "1",
            justifyContent: "center",
            fill: color,
            stroke: showStroke ? "lime" : undefined,
            strokeWidth: showStroke ? 8 : undefined,
          }}
          deps={[showStroke, color]}
          viewBox={`0 0 ${width} ${height}`}
          dangerouslySetInnerHTML={{ __html: `<path d="${path}" />` }}
        />
        {completed && (
          <View
            css={{ position: "absolute", top: 1, left: 1, fontSize: "30px" }}
          >
            {emoji}
          </View>
        )}
        {uid && !hideBadge && (
          <Badge
            uid={uid}
            css={{
              position: "absolute",
              bottom: 1,
              right: 1,
              cursor: onBadgeClick ? "pointer" : undefined,
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
    </View>
  )
}
