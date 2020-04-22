import { Text } from "./text"
import { extendPrimitive } from "css-system"

export const Error = extendPrimitive(
  Text,
  ({ as = "small", css, ...props }) => {
    return {
      as,
      css: {
        color: "errorText",
        ...css,
      },
      ...props,
    }
  }
)

export const Title = extendPrimitive(Text, {
  fontSize: 4,
  fontWeight: "bold",
})

export const SubTitle = extendPrimitive(Text, {
  fontSize: 3,
  fontWeight: "bold",
})

export const Similink = extendPrimitive(Text, {
  cursor: "pointer",
  textDecoration: "underline",
})
