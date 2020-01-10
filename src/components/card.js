import React from "react"
import { View } from "./view"

export const Card = ({ tangram, ...props }) => (
  <View
    background="#aabbcc"
    borderRadius={5}
    p={2}
    display="flex"
    flexDirection="column"
    justifyContent="space-between"
    textAlign="center"
    border="5px solid #fff"
    width={128}
    height={178}
    style={{
      boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
      cursor: "pointer",
    }}
    {...props}
  >
    <View
      as="svg"
      flex="1"
      alt=""
      viewBox={`0 0 ${tangram.width} ${tangram.height}`}
      dangerouslySetInnerHTML={{ __html: tangram.svg }}
    />
    <View mt={2}>
      {tangram.percent > 70 ? "Easy" : tangram.percent > 40 ? "Medium" : "Easy"}
    </View>
  </View>
)
