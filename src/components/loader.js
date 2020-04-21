import { useKeyframes, ThemeContext } from "css-system"
import React, { useContext } from "react"
import { View } from "./view"

export const Loader = ({ css, ...props }) => {
  const spin = useKeyframes({
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(360deg)",
    },
  })

  const gradient = useKeyframes({
    0: { borderTopColor: "pieces.lt2" },
    14: { borderTopColor: "pieces.rh" },
    28: { borderTopColor: "pieces.st2" },
    42: { borderTopColor: "pieces.mt1" },
    57: { borderTopColor: "pieces.st1" },
    71: { borderTopColor: "pieces.lt1" },
    85: { borderTopColor: "pieces.sq" },
    100: { borderTopColor: "pieces.lt2" },
  })

  const theme = useContext(ThemeContext)

  return (
    <View
      css={{
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        size: `${Math.round(theme.sizes.button * 1.4)}px`,
        ...css,
        "& > div": {
          position: "absolute",
          size: "button",
          borderColor: "transparent",
          borderStyle: "solid",
          borderWidth: "loader",
          borderRadius: "50%",
          animation: `${spin} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite, ${gradient} 10s linear infinite both`,
          "&:nth-child(1)": {
            animationDelay: "-0.45s",
          },
          "&:nth-child(2)": {
            animationDelay: "-0.3s",
          },
          "&:nth-child(3)": {
            animationDelay: "-0.15s",
          },
        },
      }}
      {...props}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </View>
  )
}
