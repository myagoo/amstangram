import React, { useState } from "react"
import { View } from "./components/view"

export const Galery = ({ galery, onSelect }) => {
  const [opened, setOpened] = useState(false)
  return (
    <View
      position="fixed"
      top={0}
      left={0}
      right={0}
      style={{ top: opened ? 0 : -180, transition: "top ease 500ms" }}
    >
      <View
        display="flex"
        alignItems="stretch"
        p={2}
        height={160}
        background="green"
      >
        {galery.map(({ svg, width, height }, index) => (
          <View
            key={index}
            p={2}
            background="white"
            borderRadius={5}
            display="flex"
            flexDirection="column"
            style={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)" }}
            // onClick={() => onSelect(svg)}
          >
            <span>Square</span>
            <View
              as="svg"
              key={index}
              alt=""
              width={100}
              height={100}
              viewBox={`0 0 ${width} ${height}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <span>By myagoo</span>
          </View>
        ))}
      </View>
      <View
        position="absolute"
        top="100%"
        left="50%"
        background="green"
        style={{ transform: "translateX(-50%)" }}
        onClick={() => setOpened(!opened)}
      >
        Toggle gallery
      </View>
    </View>
  )
}
