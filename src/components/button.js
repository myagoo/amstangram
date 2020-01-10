import styled from "styled-components"
import { View } from "./view"

export const Button = styled(View).attrs({
  as: "button",
  border: "3px solid #aabbcc",
  borderRadius: 5,
  fontSize: 2,
  color: "#aabbcc",
  px: 2,
  py: 1,
})`
  cursor: pointer;

  &:hover {
    opacity: 0.6;
  }

  &:focus {
    outline: none;
  }
`
