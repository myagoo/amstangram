import styled from "styled-components"
import {
  background,
  border,
  color,
  compose,
  flexbox,
  grid,
  layout,
  position,
  shadow,
  space,
  system,
  typography,
} from "styled-system"

export const View = styled.div`
  ${compose(
    background,
    border,
    color,
    flexbox,
    grid,
    layout,
    position,
    shadow,
    space,
    typography,
    system({ transform: true, transition: true, cursor: true })
  )}
`
