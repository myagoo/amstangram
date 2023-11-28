import "./analytics"

import { useGlobalCss } from "css-system"
import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { App } from "./components/app"
import { View } from "./components/view"
import { COLOR_TRANSITION_DURATION } from "./constants"
import { DialogProvider } from "./contexts/dialog"
import { GalleryProvider } from "./contexts/gallery"
import { LanguageProvider } from "./contexts/language"
import { NotifyProvider } from "./contexts/notify"
import { ShowBackgroundPatternProvider } from "./contexts/showBackgroundPattern"
import { ShowParticlesProvider } from "./contexts/showParticles"
import { SoundProvider } from "./contexts/sound"
import { SwitchThemeProvider } from "./contexts/switchTheme"
import { TangramsProvider } from "./contexts/tangrams"
import { TipsProvider } from "./contexts/tips"
import { UserProvider } from "./contexts/user"

// Try to remove service workers... Not sure this is useful
navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (let registration of registrations) {
    registration.unregister()
  }
})

const Main = () => {
  useEffect(() => {
    if (matchMedia("hover: none").matches) {
      window.oncontextmenu = function () {
        return false
      }
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
    "body, html, #root": {
      height: "100%",
    },
    "#root": {
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
                <ShowParticlesProvider>
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
                </ShowParticlesProvider>
              </ShowBackgroundPatternProvider>
            </TangramsProvider>
          </UserProvider>
        </NotifyProvider>
      </LanguageProvider>
    </SoundProvider>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <SwitchThemeProvider>
    <Main />
  </SwitchThemeProvider>
)
