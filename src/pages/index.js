import { useGlobalCss } from "css-system"
import React, { useEffect } from "react"
import { App } from "../components/app"
import { COLOR_TRANSITION_DURATION } from "../constants"
import { GalleryProvider } from "../contexts/gallery"
import { LanguageProvider } from "../contexts/language"
import { NotifyProvider } from "../contexts/notify"
import { ShowBackgroundPatternProvider } from "../contexts/showBackgroundPattern"
import { SoundProvider } from "../contexts/sound"
import { TangramsProvider } from "../contexts/tangrams"
import { UserProvider } from "../contexts/user"
import { DialogProvider } from "../contexts/dialog"
import { TipsProvider } from "../contexts/tips"
import { View } from "../components/view"

export default () => {
  useEffect(() => {
    window.oncontextmenu = function () {
      return false
    }
  }, [])
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
      "-moz-user-select": "none",
      "-khtml-user-select": "none",
      "-webkit-user-select": "none",
      "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
    },
    "input, textarea": {
      "-webkit-user-select": "initial",
      "-moz-user-select": "initial",
      "-ms-user-select": "initial",
      userSelect: "initial",
    },
  })

  return (
    <SoundProvider>
      <LanguageProvider>
        <NotifyProvider>
          <UserProvider>
            <TangramsProvider>
              <ShowBackgroundPatternProvider>
                <GalleryProvider>
                  <TipsProvider>
                    <DialogProvider>
                      <View
                        css={{
                          flex: "1",
                          color: "dialogText",
                          fontSize: 3,
                        }}
                      >
                        <App></App>
                      </View>
                    </DialogProvider>
                  </TipsProvider>
                </GalleryProvider>
              </ShowBackgroundPatternProvider>
            </TangramsProvider>
          </UserProvider>
        </NotifyProvider>
      </LanguageProvider>
    </SoundProvider>
  )
}
