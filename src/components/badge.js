import React, { useContext } from "react"
import { View } from "./view"
import { SoundContext } from "../contexts/sound"
import { ThemeContext } from "css-system"

export const Badge = ({ uid, size = "badge", css, onClick, ...props }) => {
  const { playButton } = useContext(SoundContext)
  const theme = useContext(ThemeContext)
  const urlSize = Math.max(40, theme.sizes[size] || size)
  return (
    <View
      as="img"
      src={`https://api.adorable.io/avatars/${urlSize}/${uid}.png`}
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
