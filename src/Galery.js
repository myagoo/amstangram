import React, { useContext, useState } from "react"
import { FiX } from "react-icons/fi"
import { CardRecto, CardVerso } from "./components/card"
import { View } from "./components/view"
import { GalleryContext } from "./gallery-provider"

export const Galery = ({ onSelect }) => {
  const [open, setOpen] = useState(false)
  const { tangrams, setSelectedTangram } = useContext(GalleryContext)

  return (
    <>
      <CardStack
        tangrams={tangrams}
        onClick={() => setOpen(true)}
        style={{
          cursor: "pointer",
        }}
      />
      <View
        position="fixed"
        right={0}
        top={0}
        width="100vw"
        height="100vh"
        background="#ecf0f1"
        borderLeft="10px solid #fff"
        display="flex"
        justifyContent="center"
        alignItems="center"
        overflowY="scroll"
        style={{
          transform: `translateX(${open ? 0 : 100}%)`,
          transition: "transform ease 500ms",
        }}
      >
        <View
          as={FiX}
          position="absolute"
          top={20}
          right={20}
          fontSize="40px"
          onClick={() => setOpen(false)}
          style={{
            cursor: "pointer",
          }}
        />
        {tangrams.length > 0 ? (
          <View
            width="100%"
            height="100%"
            display="grid"
            gridTemplateColumns="repeat(auto-fill, 180px)"
            gridColumnGap={10}
            gridRowGap={15}
            gridAutoRows={220}
            justifyContent="center"
            alignContent="center"
          >
            {tangrams.map((tangram, index) => (
              <CardVerso
                key={index}
                tangram={tangram}
                width={128}
                height={178}
                onClick={() => {
                  setOpen(false)
                  setSelectedTangram(tangram.svg)
                }}
                style={{
                  cursor: "pointer",
                }}
              />
            ))}
          </View>
        ) : (
          <View>{"Aucun tangram dans la galerie"}</View>
        )}
      </View>
    </>
  )
}

const CardStack = ({ tangrams, ...props }) => {
  return (
    <View position="fixed" right={300} top={200} {...props}>
      <CardRecto
        position="absolute"
        top={1}
        style={{
          transform: "rotateZ(-2deg)",
        }}
      />
      <CardRecto
        position="absolute"
        top={7}
        style={{
          transform: "rotateZ(6deg)",
        }}
      />
      <CardRecto position="absolute" top={0} />
    </View>
  )
}
