const React = require("react")
const { GalleryProvider } = require("./src/contexts/gallery")

exports.wrapPageElement = ({ element }) => {
  return <GalleryProvider>{element}</GalleryProvider>
}

exports.onServiceWorkerUpdateFound = () => {
  if (
    window.confirm(
      "Une nouvelle version d'Amstangram est disponible. Recharger l'application  ?"
    )
  ) {
    window.location.reload(true)
  }
}
