import React, { useContext } from "react"
import { FiSave } from "react-icons/fi"
import { HEADER_HEIGHT } from "../constants"
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
        borderTop: "10px solid #FF9FF3",
      }}
    >
      <View
        css={{
          height: HEADER_HEIGHT,
          maxWidth: 1250,
          width: "100%",
          alignSelf: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View css={{ color: "#fff", py: 2, alignSelf: "center" }}>
          <Logo width={300} />
        </View>
        <View
          css={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            onClick={() => setGalleryOpened(opened => !opened)}
            css={{
              cursor: "pointer",
              px: 2,
            }}
          >
            Gallery
          </View>
          {process.env.NODE_ENV === "development" && (
            <Button
              onClick={requestSave}
              css={{
                ml: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View as={FiSave} css={{ fontSize: "30px", color: "#fff" }} />
              <View css={{ ml: 1 }}>Enregistrer dans la gallery</View>
            </Button>
          )}
        </View>
      </View>
    </View>
  )
}
