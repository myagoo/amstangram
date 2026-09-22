import React, { useContext, useMemo } from "react"
import { ImageView } from "./view"
import { SoundContext } from "../contexts/sound"
import { ThemeContext } from "../utils/styles"

export const Badge = ({ uid, size = "badge", css, onClick, ...props }: import("../utils/styles").StyleProps & { uid: string; size?: string; onClick?: React.MouseEventHandler<HTMLImageElement> }) => {
  const { playButton } = useContext(SoundContext)
  const theme = useContext(ThemeContext)

  const backgroundColor = useMemo(() => {
    const pieceColors = Object.values(theme.colors.pieces)
    return pieceColors[uid.charCodeAt(0) % pieceColors.length].slice(1)
  }, [theme, uid])

  return (
    <ImageView
      src={`https://api.dicebear.com/7.x/croodles-neutral/svg?seed=${uid}&backgroundColor=${encodeURIComponent(backgroundColor)}`}
      css={{
        m: "2px",
        boxShadow: "0 0 0 2px {colors.dialogText}",
        borderRadius: "50%",
        boxSize: size === "badgeBig" ? "badgeBig" : "badge",
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
    ></ImageView>
  )
}
