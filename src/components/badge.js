import React, { useContext, useMemo } from "react"
import { View } from "./view"
import { SoundContext } from "../contexts/sound"
import { ThemeContext } from "css-system"

export const Badge = ({ uid, size = "badge", css, onClick, ...props }) => {
  const { playButton } = useContext(SoundContext)
  const theme = useContext(ThemeContext)

  const backgroundColor = useMemo(() => {
    const pieceColors = Object.values(theme.colors.pieces)
    return pieceColors[uid.charCodeAt(0) % pieceColors.length]
  }, [theme, uid])

  return (
    <View
      as="img"
      src={`https://avatars.dicebear.com/4.9/api/croodles-neutral/${uid}.svg?size=${theme.sizes[size]}&b=${encodeURIComponent(backgroundColor)}`}
      css={{
        m: "2px",
        boxShadow: `0 0 0 2px ${theme.colors.dialogText}`,
        borderRadius: "50%",
        size,
        ...css,
      }}
      onClick={
        onClick
          ? (e) => {
              playButton()
              onClick(e)
            }
          : undefined
      }
      {...props}
    ></View>
  )
}
