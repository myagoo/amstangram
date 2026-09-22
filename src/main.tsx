import "./index.css"
import React, { useEffect } from "react"
import ReactDOM from "react-dom/client"
import { App } from "./components/app"
import { View } from "./components/view"
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
if (window.isSecureContext) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

const Main = () => {
  useEffect(() => {
    if (matchMedia("hover: none").matches) {
      window.oncontextmenu = function() {
        return false
      }
    }
  }, [])


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
                            fontSize: "3",
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SwitchThemeProvider>
    <Main />
  </SwitchThemeProvider>
)
