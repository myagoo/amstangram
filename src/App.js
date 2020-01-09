import React, { useState } from "react"
import { ThemeProvider } from "styled-components"
import { View } from "./components/view"
import { Galery } from "./Galery"
import { Tangram } from "./Tangram"

function App() {
  const [galery, setGalery] = useState([])
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState()

  const handleSave = tan => {
    setGalery([...galery, tan])
  }
  const handleSelect = imageDataUrl => {
    setSelectedImageDataUrl(imageDataUrl)
  }
  return (
    <ThemeProvider theme={{}}>
      <View display="flex" flexDirection="column" height="100vh" width="100vw">
        <Tangram
          onSave={handleSave}
          patternImageDataUrl={selectedImageDataUrl}
        ></Tangram>
        <Galery galery={galery} onSelect={handleSelect}></Galery>
      </View>
    </ThemeProvider>
  )
}

export default App
