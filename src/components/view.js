import { createLoosePrimitive, useGap } from "css-system"

export const View = createLoosePrimitive("div", (css) => {
  return useGap({
    display: "flex",
    minWidth: 0,
    minHeight: 0,
    flex: "none",
    alignSelf: "auto",
    alignItems: "stretch",
    flexDirection: "column",
    justifyContent: "flex-start",
    ...css,
  })
})
