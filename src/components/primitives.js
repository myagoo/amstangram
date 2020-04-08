import { extendPrimitive } from "../utils/createPrimitive"
import { Text } from "./text"

export const Error = extendPrimitive(
  Text,
  {
    color: "errorText",
  },
  { as: "small" }
)

export const Title = extendPrimitive(Text, {
  fontSize: 4,
  fontWeight: "bold",
})

export const SubTitle = extendPrimitive(Text, {
  fontSize: 3,
  fontWeight: "bold",
})
