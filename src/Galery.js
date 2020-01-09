import React, { useState } from "react"
import { FiArrowDownCircle } from "react-icons/fi"
import { View } from "./components/view"

export const Galery = ({ galery, onSelect }) => {
  const [opened, setOpened] = useState(false)

  if (galery.length === 0) {
    return null
  }

  return (
    <View
      position="fixed"
      top={0}
      left={0}
      right={0}
      style={{
        transform: `translateY(${opened ? 0 : -100}%)`,
        transition: "transform ease 500ms",
      }}
    >
      <View display="flex" alignItems="stretch" p={2} background="#34495e">
        {galery.map(({ svg, width, height, percent }, index) => {
          return (
            <View
              key={index}
              p={2}
              background="#aabbcc"
              border="5px solid #fff"
              borderRadius={5}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              textAlign="center"
              width={128}
              height={178}
              mr={2}
              style={{ boxShadow: "5px 5px 5px 0px rgba(0, 0, 0, 0.5)" }}
              // onClick={() => onSelect(svg)}
            >
              <View
                as="svg"
                key={index}
                alt=""
                viewBox={`0 0 ${width} ${height}`}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <View mt={2}>
                {percent > 70 ? "Easy" : percent > 40 ? "Medium" : "Easy"}
              </View>
            </View>
          )
        })}
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
        <View
          as={FiArrowDownCircle}
          width={30}
          height={30}
          style={{
            transform: `rotate(${opened ? 180 : 0}deg)`,
            transition: "transform ease 500ms",
          }}
        />
      </View>
    </View>
  )
}
