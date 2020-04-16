import { Text } from "./text"
import { extendLoosePrimitive } from "css-system"

export const Error = extendLoosePrimitive(
  Text,
  {
    color: "errorText",
  },
  { as: "small" }
)

export const Title = extendLoosePrimitive(Text, {
  fontSize: 4,
  fontWeight: "bold",
})

export const SubTitle = extendLoosePrimitive(Text, {
  fontSize: 3,
  fontWeight: "bold",
})

export const Similink = extendLoosePrimitive(Text, {
  cursor: "pointer",
  textDecoration: "underline",
})
