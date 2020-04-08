require("firebase/auth")
require("firebase/firestore")

exports.onServiceWorkerUpdateFound = () => {
  if (
    window.confirm(
      "Une nouvelle version d'Amstangram est disponible. Recharger l'application  ?"
    )
  ) {
    window.location.reload(true)
  }
}
