import { styled } from "../../styled-system/jsx"
import type { ComponentProps } from "react"
import { useContext } from "react"
import { SoundContext } from "../contexts/sound"

const StyledButton = styled("button", {
  base: {
    borderRadius: "2",
    minWidth: 0,
    minHeight: 0,
    flex: "none",
    fontFamily: "inherit",
    fontWeight: "bolder",
    border: "none",
    fontSize: "inherit",
    color: "inherit",
    background: "none",
    cursor: "pointer",
    p: "3",
    "&:disabled": { opacity: 0.3, cursor: "not-allowed" },
    "&:focus": { outline: "none" },
  },
})

type ButtonProps = ComponentProps<typeof StyledButton> & { mute?: boolean }

const BaseButton = ({ onClick, mute, ...props }: ButtonProps) => {
  const { playButton } = useContext(SoundContext)
  return (
    <StyledButton
      {...props}
      onClick={(event) => {
        if (!mute) playButton()
        onClick?.(event)
      }}
    />
  )
}

export const SecondaryButton = ({ css, ...props }: ButtonProps) => (
  <BaseButton
    {...props}
    css={{ border: "2px solid", borderRadius: "2", ...css }}
  />
)

export const DangerButton = ({ css, ...props }: ButtonProps) => (
  <BaseButton
    {...props}
    css={{ border: "2px solid", color: "errorText", ...css }}
  />
)

export const PrimaryButton = ({ css, ...props }: ButtonProps) => (
  <BaseButton
    {...props}
    css={{
      animation: "pieceBackground 20s linear infinite both",
      color: "#FFFFFFDD",
      ...css,
    }}
  />
)
