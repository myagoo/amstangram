import React, { useContext } from "react"
import { useStyle } from "use-style"
import { ThemeContext } from "../Theme"

export const Button = ({ as: Component = "button", css, ...props }) => {
  const theme = useContext(ThemeContext)

  const className = useStyle(
    {
      background: "#48DBFB",
      borderRadius: 5,
      fontSize: 2,
      color: "#fff",
      px: 2,
      py: 1,
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
