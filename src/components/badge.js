import React from "react"
import { View } from "./view"

export const Badge = ({ uid, size = 40, css, ...props }) => {
  return (
    <View
      as="img"
      src={`https://api.adorable.io/avatars/${size}/${uid}.png`}
      css={{
        border: "2px solid",
        borderColor: "dialogText",
        borderRadius: "50%",
        size,
        ...css,
      }}
      {...props}
    ></View>
  )
}
