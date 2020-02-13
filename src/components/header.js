import React, { useContext } from "react"
import { FiSave } from "react-icons/fi"
import { HEADER_HEIGHT } from "../constants"
import { Button } from "./button"
import { GalleryContext } from "./gallery-provider"
import { Link } from "./link"
import { Logo } from "./logo"
import { View } from "./view"

export const Header = () => {
  const { requestSave, setGalleryOpened } = useContext(GalleryContext)
  return (
    <View
      background="#fff"
      borderTop="10px solid #FF9FF3"
      width="100%"
      display="flex"
      justifyContent="center"
    >
      <View
        height={HEADER_HEIGHT}
        maxWidth={1250}
        width="100%"
        alignSelf="center"
        display="flex"
        justifyContent="space-between"
      >
        <Link to="/" color="#fff" py={2}>
          <Logo width={300} />
        </Link>
        <View display="flex" alignItems="center">
          <View
            onClick={() => setGalleryOpened(opened => !opened)}
            cursor="pointer"
            px={2}
          >
            Gallery
          </View>
          <Button
            onClick={requestSave}
            ml={3}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={1}
          >
            <FiSave as={View} fontSize="30px" display="block" color="#fff" />
            <View ml={1}>Enregistrer dans la gallery</View>
          </Button>
        </View>
      </View>
    </View>
  )
}
