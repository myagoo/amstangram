const React = require("react")
const { GalleryProvider } = require("./src/contexts/gallery")
const { ThemeProvider } = require("./src/contexts/theme")

exports.wrapPageElement = ({ element }) => {
  return (
    <ThemeProvider>
      <GalleryProvider>{element}</GalleryProvider>
    </ThemeProvider>
  )
}
