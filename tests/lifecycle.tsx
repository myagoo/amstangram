import "../src/index.css"
import { useContext, useState } from "react"
import { createRoot } from "react-dom/client"
import { Tangram } from "../src/components/tangram"
import { DialogProvider } from "../src/contexts/dialog"
import { GalleryContext, GalleryProvider } from "../src/contexts/gallery"
import { LanguageProvider } from "../src/contexts/language"
import { NotifyProvider } from "../src/contexts/notify"
import { ShowBackgroundPatternProvider } from "../src/contexts/showBackgroundPattern"
import { ShowParticlesProvider } from "../src/contexts/showParticles"
import { SoundProvider } from "../src/contexts/sound"
import { SwitchThemeProvider } from "../src/contexts/switchTheme"
import { TangramsContext, TangramsProvider } from "../src/contexts/tangrams"
import { TipsProvider } from "../src/contexts/tips"
import { UserContext, UserProvider } from "../src/contexts/user"

// Real providers and gameplay, with only React mount control added by the fixture.
function LifecycleFixture() {
  const [mounted, setMounted] = useState(true)
  const { initialized: usersReady } = useContext(UserContext)
  const { initialized: tangramsReady } = useContext(TangramsContext)
  const { initialized: galleryReady, playlist } = useContext(GalleryContext)
  if (!usersReady || !tangramsReady || !galleryReady || !playlist) return null
  return (
    <>
      {mounted && <Tangram />}
      <button
        style={{ position: "fixed", bottom: 0, right: 0, zIndex: 10 }}
        onClick={() => setMounted((value) => !value)}
      >
        {mounted ? "Unmount game" : "Mount game"}
      </button>
    </>
  )
}

const providers = [
  SwitchThemeProvider,
  SoundProvider,
  LanguageProvider,
  NotifyProvider,
  UserProvider,
  TangramsProvider,
  ShowBackgroundPatternProvider,
  ShowParticlesProvider,
  GalleryProvider,
  TipsProvider,
  DialogProvider,
]
createRoot(document.getElementById("root")!).render(
  providers.reduceRight(
    (children, Provider) => <Provider>{children}</Provider>,
    <LifecycleFixture />
  )
)
