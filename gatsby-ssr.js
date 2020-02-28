const React = require("react")
const { GalleryProvider } = require("./src/contexts/gallery")

exports.wrapPageElement = ({ element }) => {
  return <GalleryProvider>{element}</GalleryProvider>
}
