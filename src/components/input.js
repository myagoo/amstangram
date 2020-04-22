import { createPrimitive } from "css-system"

export const Input = createPrimitive(
  "input",
  ({ css, type = "text", ...props }) => ({
    css: {
      color: "inherit",
      fontSize: "inherit",
      bg: "inputBackground",
      border: "none",
      borderRadius: 2,
      borderColor: "currentColor",
      p: 2,
      "&:disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
      },
      "&:focus": {
        outline: "none",
      },
      ...css,
    },
    type,
    ...props,
  })
)
