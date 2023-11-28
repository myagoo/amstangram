import { init } from "@sentry/browser"
import { DIALOG_CLOSED_REASON } from "./constants"

if (import.meta.env.PROD) {
    window.dataLayer = window.dataLayer || []
    function gtag() {
        dataLayer.push(arguments)
    }
    gtag("js", new Date())

    gtag("config", "G-F7R3KZMTTS", {
        anonymize_ip: true,
        cookie_expires: 0,
    })
}

init({
    dsn: "https://1b2f34262d80460298da419637b59901@o375098.ingest.sentry.io/5194058",
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    beforeSend: (event, hint) => {
        if (hint.originalException === DIALOG_CLOSED_REASON) {
            return null
        }
        return event
    },
})