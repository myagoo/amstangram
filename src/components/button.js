import { useCss, useKeyframes } from "css-system"
import React from "react"

export const Button = ({ as: Component = "button", css, ...props }) => {
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

  const className = useCss({
    animation: `${gradient} 20s linear infinite both`,
    backgroundSize: "2000% 2000%",
    boxShadow: "0px 5px 10px #00000080",
    border: 0,
    borderRadius: "50%",
    fontSize: 5,
    color: "#FFFFFFCC",
    size: "button",
    cursor: "pointer",
    p: 0,
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
