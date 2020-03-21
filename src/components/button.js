import { useCss } from "@css-system/use-css"
import React from "react"

export const Button = ({ as: Component = "button", css, ...props }) => {
  const className = useCss({
    bg: "pieces.mt1",
    border: 0,
    borderRadius: "50%",
    fontSize: 2,
    color: "#fff",
    p: 2,
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
  })

  return <Component className={className} {...props} />
}
