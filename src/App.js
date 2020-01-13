import React, { useState } from "react"
import { createGlobalStyle, ThemeProvider } from "styled-components"
import { View } from "./components/view"
import { Galery } from "./Galery"
import { Tangram } from "./Tangram"
import { theme } from "./theme"

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Sail&display=swap');

  body {	
    margin: 0;	
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',	'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',	sans-serif;	
    -webkit-font-smoothing: antialiased;	
    -moz-osx-font-smoothing: grayscale;
  }
`

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
    <ThemeProvider theme={theme}>
      <GlobalStyle />
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
