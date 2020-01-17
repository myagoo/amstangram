import React from "react"
import { createGlobalStyle, ThemeProvider } from "styled-components"
import { View } from "./components/view"
import { Galery } from "./Galery"
import { GalleryProvider } from "./gallery-provider"
import { Tangram } from "./Tangram"
import { theme } from "./theme"

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Sail&display=swap');

  body {	
    margin: 0;	
    background: #fff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',	'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',	sans-serif;	
    -webkit-font-smoothing: antialiased;	
    -moz-osx-font-smoothing: grayscale;
  }
`

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <GalleryProvider>
        <View
          display="flex"
          flexDirection="column"
          height="100vh"
          width="100vw"
        >
          <Tangram></Tangram>
          <Galery></Galery>
        </View>
      </GalleryProvider>
    </ThemeProvider>
  )
}

export default App
