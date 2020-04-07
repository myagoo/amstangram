import { useCss, useKeyframes } from "css-system"
import React from "react"

export const PrimaryButton = ({ as: Component = "button", css, ...props }) => {
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
    minWidth: 0,
    minHeight: 0,
    flex: "none",
    animation: `${gradient} 20s linear infinite both`,
    fontWeight: "bold",
    border: 0,
    borderRadius: 2,
    fontSize: "inherit",
    color: "#FFFFFFDD",
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
  })

  return <Component className={className} {...props} />
}

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
    color: "#FFFFFFDD",
    size: "button",
    cursor: "pointer",
    p: 0,
    "&:disabled": {
      opacity: 0.3,
      cursor: "not-allowed",
    },
    "&:focus": {
      outline: "none",
    },
    ...css,
  })

  return <Component className={className} {...props} />
}
