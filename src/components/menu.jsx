import { useKeyframes } from "css-system"
import React, { useContext, useEffect } from "react"
import { FiMenu } from "react-icons/fi"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { SoundContext } from "../contexts/sound"
import { View } from "./view"

export const Menu = () => {
  const { playlist, saveRequestId } = useContext(GalleryContext)
  const { playButton } = useContext(SoundContext)
  const { showMenu } = useContext(DialogContext)

  const handleMenuClick = async () => {
    playButton()
    showMenu()
  }

  const gradient = useKeyframes({
    0: { color: "pieces.lt2" },
    14: { color: "pieces.rh" },
    28: { color: "pieces.st2" },
    42: { color: "pieces.mt1" },
    57: { color: "pieces.st1" },
    71: { color: "pieces.lt1" },
    85: { color: "pieces.sq" },
    100: { color: "pieces.lt2" },
  })

  return (
    <>
      <View
        css={{
          position: "fixed",
          top: 3,
          left: 3,
          animation: `${gradient} 20s linear infinite both`,
        }}
      >
        <View
          as={FiMenu}
          css={{
            size: "menu",
            cursor: "pointer",
          }}
          onClick={handleMenuClick}
        ></View>
      </View>
    </>
  )
}
