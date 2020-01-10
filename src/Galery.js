import React, { useState } from "react"
import { FiArrowDownCircle } from "react-icons/fi"
import { Card } from "./components/card"
import { View } from "./components/view"

export const Galery = ({ galery, onSelect }) => {
  const [opened, setOpened] = useState(false)

  if (galery.length === 0) {
    return null
  }

  return (
    <>
      <View
        position="fixed"
        top={0}
        left={0}
        right={0}
        p={2}
        pb={0}
        background="#34495e"
        display="flex"
        flexWrap="wrap"
        style={{
          transform: `translateY(${opened ? 0 : -100}%)`,
          transition: "transform ease 500ms",
        }}
      >
        {galery.map((tangram, index) => {
          return (
            <Card
              key={index}
              flex="none"
              mr={2}
              mb={2}
              tangram={tangram}
              onClick={() => {
                onSelect(tangram.svg)
              }}
            ></Card>
          )
        })}
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
    </>
  )
}
