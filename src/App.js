import React from "react"
import { GalleryProvider } from "./components/gallery-provider"
import { Gallery } from "./components/gallery"
import { Header } from "./components/header"
import { View } from "./components/view"
import { Tangram } from "./pages/tangram"

function App() {
  return (
    <GalleryProvider>
      <View
        css={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header />
        <View
          css={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            position: "relative",
          }}
        >
          <Tangram />
          <Gallery />
        </View>
      </View>
    </GalleryProvider>
  )
}

export default App
