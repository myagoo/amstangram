import React, { useState } from "react"
import { FiArrowDownCircle, FiStar } from "react-icons/fi"
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
        background="#34495e"
      >
        {galery.map(({ svg, width, height }, index) => (
          <View
            key={index}
            p={2}
            background="white"
            borderRadius={5}
            display="flex"
            flexDirection="column"
            textAlign="center"
            mr={2}
            style={{ boxShadow: "0 0 5px rgba(0, 0, 0, 0.5)" }}
            // onClick={() => onSelect(svg)}
          >
            <View
              as="svg"
              key={index}
              alt=""
              width={100}
              height={100}
              viewBox={`0 0 ${width} ${height}`}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <View mt={2}>
              <FiStar />
              <FiStar />
            </View>
          </View>
        ))}
      </View>
      <View
        position="absolute"
        top="100%"
        left="50%"
        background="#34495e"
        color="#fff"
        p={1}
        borderBottomLeftRadius={5}
        borderBottomRightRadius={5}
        style={{ transform: "translateX(-50%)", cursor: "pointer" }}
        onClick={() => setOpened(!opened)}
      >
        <View as={FiArrowDownCircle} width={30} height={30} />
      </View>
    </View>
  )
}
