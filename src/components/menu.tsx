import React, { useContext } from "react"
import { FiMenu } from "react-icons/fi"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { SoundContext } from "../contexts/sound"
import { View } from "./view"

export const Menu = () => {
  const { playButton } = useContext(SoundContext)
  const { showMenu } = useContext(DialogContext)

  const handleMenuClick = async () => {
    playButton()
    showMenu()
  }


  return (
    <>
      <View
        css={{
          position: "fixed",
          top: "3",
          left: "3",
          animation: "pieceColor 20s linear infinite both",
        }}
      >
        <View
          as={FiMenu}
          css={{
            boxSize: "menu",
            cursor: "pointer",
          }}
          onClick={handleMenuClick}
        ></View>
      </View>
    </>
  )
}
