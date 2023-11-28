import { createPrimitive, useGap } from "css-system"

export const View = createPrimitive("div", ({ css, ...props }) => {
  return {
    css: useGap({
      display: "flex",
      minWidth: 0,
      minHeight: 0,
      flex: "none",
      alignSelf: "auto",
      alignItems: "stretch",
      flexDirection: "column",
      justifyContent: "flex-start",
      ...css,
    }),
    ...props,
  }
})
