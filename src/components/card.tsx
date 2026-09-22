import { ThemeContext } from "../utils/styles"
import React, { useContext, useMemo, useCallback } from "react"
import { SoundContext } from "../contexts/sound"
import { Badge } from "./badge"
import { View, SvgView } from "./view"
import { useLongPress } from "../utils/useLongPress"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"

import type { Tangram } from "../types"
import type { StyleProps } from "../utils/styles"

interface CardProps<T extends Tangram> extends StyleProps {
  tangram: T
  showStroke?: boolean | null
  completed?: boolean
  selected?: boolean
  hideBadge?: boolean
  onBadgeClick?: (uid: string) => void
  onClick?: (tangram: T) => void
  onLongPress?: (tangram: T) => void
}
export const Card = <T extends Tangram>({
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
}: CardProps<T>) => {
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
          borderRadius: "5px",
          m: "1",
          bg: "background",
          transition: "background-color {durations.color}",
          p: "3",
          textAlign: "center",
          position: "relative",
          cursor: onClick || onLongPress ? "pointer" : undefined,
          width: 128,
          height: 178,
        }}
        style={{ boxShadow: selected ? `0px 0px 0px 4px ${color}` : "0px 0px 0px 1px rgba(0, 0, 0, 0.1)" }}
      >
        <SvgView

          css={{
            flex: "1",
            justifyContent: "center",
            stroke: showStroke ? "lime" : undefined,
            strokeWidth: showStroke ? 8 : undefined,
          }}
          style={{ fill: color }}
          viewBox={`0 0 ${width} ${height}`}
          dangerouslySetInnerHTML={{ __html: `<path d="${path}" />` }}
        />
        {completed && (
          <View
            css={{ position: "absolute", top: "1", left: "1", fontSize: "30px" }}
          >
            {emoji}
          </View>
        )}
        {uid && !hideBadge && (
          <Badge
            uid={uid}
            css={{
              position: "absolute",
              bottom: "1",
              right: "1",
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
