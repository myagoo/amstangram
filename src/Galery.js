import React, { useEffect, useState } from "react"
import { View } from "./components/view"

export const Galery = ({ galery, onSelect }) => {
  const [card, setCard] = useState(galery.length - 1)

  useEffect(() => {
    setCard(galery.length - 1)
  }, [galery.length])

  useEffect(() => {
    if (card < 0) {
      setCard(galery.length - 1)
    }
  }, [galery.length, card])

  if (galery.length === 0) {
    return null
  }

  return (
    <View position="fixed" right={200} top={200}>
      {galery.map(
        ({ svg, width, height, percent }, index) =>
          index <= card && (
            <View
              key={index}
              onClick={() => setCard(card - 1)}
              background="#aabbcc"
              borderRadius={5}
              position="absolute"
              top={0}
              p={2}
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              textAlign="center"
              border="5px solid #fff"
              width={128}
              height={178}
              style={{
                transform: `translate(-${index}px, -${index}px)`,
                zIndex: index,
                boxShadow: "0px 0px 0px 1px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
              }}
            >
              <View mb={2}>{index}</View>
              <View
                as="svg"
                key={index}
                flex="1"
                alt=""
                viewBox={`0 0 ${width} ${height}`}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <View mt={2}>
                {percent > 70 ? "Easy" : percent > 40 ? "Medium" : "Easy"}
              </View>
            </View>
          )
      )}
    </View>
  )
}
