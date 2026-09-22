import { styled } from "../../styled-system/jsx"
import { cva } from "../../styled-system/css"

const input = cva({
  base: {
    color: "inherit",
    fontFamily: "inherit",
    fontWeight: "bolder",
    fontSize: "inherit",
    bg: "inputBackground",
    border: "none",
    borderRadius: "2",
    borderColor: "currentColor",
    p: "2",
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    "&:focus": {
      outline: "none",
    },
  },
})

export const Input = styled("input", input)
export const Select = styled("select", input)
