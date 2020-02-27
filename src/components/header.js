import React, { useContext } from "react"
import { FiGrid, FiSave } from "react-icons/fi"
import { GalleryContext } from "../contexts/gallery"
import { Button } from "./button"
import { Logo } from "./logo"
import { View } from "./view"

export const Header = () => {
  const { requestSave, setGalleryOpened } = useContext(GalleryContext)
  return (
    <View
      css={{
        background: "#fff",
        borderTop: "5px solid",
        borderColor: "mt1",
        p: 2,
      }}
    >
      <View
        css={{
          maxWidth: 1250,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <View
          css={{
            color: "#fff",
            alignSelf: "center",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <Logo width="100%" />
        </View>

        <Button
          onClick={() => setGalleryOpened(opened => !opened)}
          css={{
            position: "absolute",
            right: 10,
            bottom: 10,
            zIndex: 1,
          }}
        >
          <View as={FiGrid} css={{ fontSize: "20px", color: "#fff" }} />
        </Button>
        {process.env.NODE_ENV === "development" && (
          <Button
            onClick={requestSave}
            css={{
              position: "absolute",
              right: 10,
              bottom: 60,
              zIndex: 1,
            }}
          >
            <View as={FiSave} css={{ fontSize: "20px", color: "#fff" }} />
          </Button>
        )}
      </View>
    </View>
  )
}
