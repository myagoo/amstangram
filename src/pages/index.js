import { useGlobalCss } from "css-system"
import React from "react"
import { Tangram } from "../components/tangram"
import { COLOR_TRANSITION_DURATION } from "../constants"
import { GalleryProvider } from "../contexts/gallery"
import { LanguageProvider } from "../contexts/language"
import { NotifyProvider } from "../contexts/notify"
import { SettingsProvider } from "../contexts/settings"
import { ShowBackgroundPatternProvider } from "../contexts/showBackgroundPattern"
import { UserProvider } from "../contexts/user"

export default () => {
  useGlobalCss({
    body: {
      m: 0,
      bg: "background",
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
        "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif`,
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
      transition: `background-color ${COLOR_TRANSITION_DURATION}ms`,
    },
    "body, html, #___gatsby, #gatsby-focus-wrapper": {
      height: "100%",
    },
    "#gatsby-focus-wrapper": {
      display: "flex",
      flexDirection: "column",
      padding: `
        env(safe-area-inset-top, 0)
        env(safe-area-inset-right, 0)
        env(safe-area-inset-bottom, 0)
        env(safe-area-inset-left, 0)
      `,
    },
    "*": {
      boxSizing: "border-box",
      userSelect: "none",
      "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
    },
  })

  return (
    <LanguageProvider>
      <NotifyProvider>
        <UserProvider>
          <ShowBackgroundPatternProvider>
            <GalleryProvider>
              <SettingsProvider>
                <Tangram />
              </SettingsProvider>
            </GalleryProvider>
          </ShowBackgroundPatternProvider>
        </UserProvider>
      </NotifyProvider>
    </LanguageProvider>
  )
}
