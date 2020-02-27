import { useCss } from "@css-system/use-css"
import React, { useContext } from "react"
import { ThemeContext } from "../contexts/theme"

export const Button = ({ as: Component = "button", css, ...props }) => {
  const theme = useContext(ThemeContext)

  const className = useCss(
    {
      bg: "mt1",
      border: 0,
      borderRadius: "50%",
      fontSize: 2,
      color: "#fff",
      p: 1,
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
      "&:not(:disabled):hover": {
        opacity: 0.6,
        cursor: "pointer",
      },
      "&:focus": {
        outline: "none",
      },
      ...css,
    },
    theme
  )

  return <Component className={className} {...props} />
}
