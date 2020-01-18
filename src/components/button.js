import styled from "styled-components"
import { View } from "./view"

export const Button = styled(View).attrs({
  as: "button",
  background: "#48DBFB",
  borderRadius: 5,
  fontSize: 2,
  color: "#fff",
  px: 2,
  py: 1,
})`
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.6;
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`
