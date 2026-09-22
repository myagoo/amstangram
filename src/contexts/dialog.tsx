import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ChallengeDialog } from "../components/challengeDialog"
import { GalleryDialog } from "../components/galleryDialog"
import { LeaderboardDialog } from "../components/leaderboardDialog"
import { LoginDialog } from "../components/loginDialog"
import { ProfileDialog } from "../components/profileDialog"
import { TangramDialog } from "../components/tangramDialog"
import { Deferred } from "../utils/deferred"
import { GalleryContext } from "./gallery"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"
import { SettingsDialog } from "../components/settingsDialog"
import { DIALOG_CLOSED_REASON } from "../constants"
import { MenuDialog } from "../components/menuDialog"
import { GenerationDialog } from "../components/generationDialog"

export const DialogContext = createContext<{
  showMenu(): void
  showProfile(uid: string): void
  showLeaderboard(): void
  showGallery(): void
  showGeneration(): void
  showLogin(): Promise<import("../types").CurrentUser | null>
  showTangram(tangram: import("../types").Tangram): void
  showSettings(): void
}>(null!)

export const DialogProvider = ({ children }: React.PropsWithChildren) => {
  const { initialized: usersInitialized } = useContext(UserContext)

  const {
    playlist,
    setPlaylist,
    startRandomPlaylist,
    initialized: galleryInitialized,
  } = useContext(GalleryContext)

  const { initialized: tangramsInitialized, approvedTangrams } =
    useContext(TangramsContext)

  const [initialized, setInitialized] = useState(false)

  const [profileUid, setProfileUid] = useState<string | null>(null)
  const showProfile = useCallback((uid: string) => setProfileUid(uid), [])

  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const showLeaderboard = useCallback(() => setLeaderboardOpen(true), [])

  const [menuOpen, setMenuOpen] = useState(false)
  const showMenu = useCallback(() => setMenuOpen(true), [])

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [generationOpen, setGenerationOpen] = useState(false)
  const showGeneration = useCallback(() => setGenerationOpen(true), [])
  const showGallery = useCallback(() => {
    setGenerationOpen(false)
    setGalleryOpen(true)
  }, [])

  const [loginDeferred, setLoginDeferred] = useState<Deferred<
    import("../types").CurrentUser
  > | null>(null)

  const showLogin = useCallback(async () => {
    const deferred = new Deferred<import("../types").CurrentUser>()
    setLoginDeferred(deferred)
    try {
      return await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) throw error
      return null
    } finally {
      setLoginDeferred(null)
    }
  }, [])

  const [tangramDialogData, setTangramDialogData] = useState<
    import("../types").Tangram | null
  >(null)
  const showTangram = useCallback(
    (tangram: import("../types").Tangram) => setTangramDialogData(tangram),
    []
  )

  const [settingsOpen, setSettingsOpen] = useState(false)
  const showSettings = useCallback(() => setSettingsOpen(true), [])

  const [challengeDialogData, setChallengeDialogData] = useState<{
    uid: string | null
    tangrams: import("../types").SavedTangram[]
    deferred: Deferred
  } | null>(null)

  useEffect(() => {
    const checkForChallenge = async () => {
      if (
        tangramsInitialized &&
        galleryInitialized &&
        usersInitialized &&
        !initialized
      ) {
        let hasBeenChallenged = false

        if (!playlist && window.location.search) {
          const searchParams = new URLSearchParams(window.location.search)

          if (searchParams.has("tangrams")) {
            const tangramIds = searchParams.get("tangrams")!.split(",")
            const uid = searchParams.get("uid")
            const challengeTangrams = approvedTangrams!.filter((tangram) =>
              tangramIds.includes(tangram.id)
            )
            if (challengeTangrams.length) {
              window.history.replaceState(
                {},
                document.title,
                window.location.origin
              )

              const deferred = new Deferred()

              setChallengeDialogData({
                deferred,
                tangrams: challengeTangrams,
                uid,
              })

              try {
                await deferred.promise
                hasBeenChallenged = true
                setPlaylist(challengeTangrams)
              } catch (error) {
                if (error !== DIALOG_CLOSED_REASON) {
                  throw error
                }
              } finally {
                setChallengeDialogData(null)
              }
            }
          }
        }

        if (!hasBeenChallenged) {
          startRandomPlaylist(true)
        }

        setInitialized(true)
      }
    }

    checkForChallenge()
  }, [tangramsInitialized, galleryInitialized, usersInitialized, initialized])

  const contextValue = useMemo(() => {
    return {
      showMenu,
      showProfile,
      showLeaderboard,
      showGallery,
      showGeneration,
      showLogin,
      showTangram,
      showSettings,
    }
  }, [
    showMenu,
    showProfile,
    showLeaderboard,
    showGallery,
    showGeneration,
    showLogin,
    showTangram,
    showSettings,
  ])

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {menuOpen && <MenuDialog onClose={() => setMenuOpen(false)} />}
      {loginDeferred && <LoginDialog deferred={loginDeferred} />}
      {generationOpen && (
        <GenerationDialog
          onClose={() => setGenerationOpen(false)}
          onStart={() => {
            setGenerationOpen(false)
            setMenuOpen(false)
          }}
        />
      )}
      {galleryOpen && (
        <GalleryDialog
          onClose={() => setGalleryOpen(false)}
          onStart={() => {
            setGalleryOpen(false)
            setMenuOpen(false)
          }}
        />
      )}
      {tangramDialogData && (
        <TangramDialog
          tangram={tangramDialogData}
          onClose={() => setTangramDialogData(null)}
        />
      )}
      {profileUid !== null && (
        <ProfileDialog uid={profileUid} onClose={() => setProfileUid(null)} />
      )}
      {leaderboardOpen && (
        <LeaderboardDialog onClose={() => setLeaderboardOpen(false)} />
      )}
      {challengeDialogData && <ChallengeDialog {...challengeDialogData} />}
      {settingsOpen && (
        <SettingsDialog onClose={() => setSettingsOpen(false)} />
      )}
    </DialogContext.Provider>
  )
}
