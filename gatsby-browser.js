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

exports.onClientEntry = () => {
  const Sentry = require("@sentry/browser")
  const { DIALOG_CLOSED_REASON } = require("./src/constants")

  Sentry.init({
    dsn:
      "https://1b2f34262d80460298da419637b59901@o375098.ingest.sentry.io/5194058",
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",
    beforeSend: (event, hint) => {
      if (hint.originalException === DIALOG_CLOSED_REASON) {
        return null
      }
      return event
    },
  })
}
