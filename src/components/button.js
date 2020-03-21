import { useCss } from "@css-system/use-css"
import React from "react"

export const Button = ({ as: Component = "button", css, ...props }) => {
  const className = useCss({
    animation: `gradient 20s linear infinite both`,
    backgroundSize: "2000% 2000%",
    boxShadow: "0px 5px 10px #00000080",
    border: 0,
    borderRadius: "50%",
    fontSize: 5,
    color: "#fff",
    p: 3,
    cursor: "pointer",
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    "&:not(:disabled):hover": {
      opacity: 0.6,
    },
    "&:focus": {
      outline: "none",
    },
    ...css,
  })

  return <Component className={className} {...props} />
}
