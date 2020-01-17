import React, { useContext } from "react"
import { FiGrid } from "react-icons/fi"
import { GalleryContext } from "../gallery-provider"
import { ReactComponent as Logo } from "../logo2.svg"
import { View } from "./view"

export const Header = () => {
  const { openGallery } = useContext(GalleryContext)
  return (
    <View
      maxWidth={1250}
      width="100%"
      alignSelf="center"
      display="flex"
      justifyContent="space-between"
      py={2}
    >
      <Logo width={300} />
      <View
        display="flex"
        alignItems="center"
        style={{ cursor: "pointer" }}
        onClick={openGallery}
      >
        <View color="#1DD1A1">Gallery</View>
        <View
          width={50}
          height={50}
          background="#1DD1A1"
          ml={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <FiGrid color="#fff" fontSize="30px" />
        </View>
      </View>
    </View>
  )
}
