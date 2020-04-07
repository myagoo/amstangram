const React = require("react")
const { TangramsProvider } = require("./src/contexts/tangrams")
require("firebase/auth")
require("firebase/firestore")

exports.wrapPageElement = ({ element }) => {
  return <TangramsProvider>{element}</TangramsProvider>
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
