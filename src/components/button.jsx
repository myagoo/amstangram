import { createPrimitive, useKeyframes, extendPrimitive } from "css-system"
import { useContext } from "react"
import { SoundContext } from "../contexts/sound"

const BaseButton = createPrimitive(
  "button",
  ({ css, onClick, mute, ...props }) => {
    const { playButton } = useContext(SoundContext)

    return {
      css: {
        borderRadius: 2,
        minWidth: 0,
        minHeight: 0,
        flex: "none",
        fontWeight: "bold",
        border: "none",
        fontSize: "inherit",
        color: "inherit",
        background: "none",
        cursor: "pointer",
        p: 3,
        "&:disabled": {
          opacity: 0.3,
          cursor: "not-allowed",
        },
        "&:focus": {
          outline: "none",
        },
        ...css,
      },
      onClick: (e) => {
        if (!mute) {
          playButton()
        }
        onClick && onClick(e)
      },
      ...props,
    }
  }
)

export const SecondaryButton = extendPrimitive(BaseButton, {
  css: {
    border: "2px solid",
    borderRadius: 2,
  },
})

export const DangerButton = extendPrimitive(BaseButton, {
  css: {
    border: "2px solid",
    color: "errorText",
  },
})

export const PrimaryButton = extendPrimitive(
  BaseButton,
  ({ css, ...props }) => {
    const gradient = useKeyframes({
      0: { bg: "pieces.lt2" },
      14: { bg: "pieces.rh" },
      28: { bg: "pieces.st2" },
      42: { bg: "pieces.mt1" },
      57: { bg: "pieces.st1" },
      71: { bg: "pieces.lt1" },
      85: { bg: "pieces.sq" },
      100: { bg: "pieces.lt2" },
    })

    return {
      css: {
        animation: `${gradient} 20s linear infinite both`,
        color: "#FFFFFFDD",
        ...css,
      },

      ...props,
    }
  }
)
