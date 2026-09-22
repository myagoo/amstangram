import { styled } from "../../styled-system/jsx"
import { cva } from "../../styled-system/css"

const view = cva({
  base: {
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    flex: "none",
    alignSelf: "auto",
    alignItems: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
})

export const View = styled("div", view)
export const FormView = styled("form", view)
export const CanvasView = styled("canvas", view)
export const SvgView = styled("svg", view)
export const ImageView = styled("img", view)
