import React, { useContext } from "react"
import { FiX } from "react-icons/fi"
import { CardVerso } from "./components/card"
import { View } from "./components/view"
import { GalleryContext } from "./gallery-provider"

export const Galery = ({ onSelect }) => {
  const {
    tangrams,
    setSelectedTangram,
    isGalleryOpened,
    closeGallery,
  } = useContext(GalleryContext)

  return (
    <>
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
          transform: `translateX(${isGalleryOpened ? 0 : 100}%)`,
          transition: "transform ease 500ms",
        }}
      >
        <View
          as={FiX}
          position="absolute"
          top={20}
          right={20}
          fontSize="40px"
          onClick={closeGallery}
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
                  closeGallery()
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
