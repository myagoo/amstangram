import { createPrimitive } from "css-system"

export const Text = createPrimitive("div", {
  css: {
    display: "inline",
    minWidth: 0,
    minHeight: 0,
    flex: "none",
  },
})
