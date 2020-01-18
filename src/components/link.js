import { Link as RouterLink } from "react-router-dom"
import styled from "styled-components"
import { View } from "./view"

const StyledLink = styled(View)`
  &[disabled] {
    pointer-events: none;
  }
`

export const Link = styled(StyledLink).attrs({
  as: RouterLink,
  color: "#1DD1A1",
})`
  text-decoration: none;

  &:not(:disabled):hover {
    cursor: pointer;
  }
`
