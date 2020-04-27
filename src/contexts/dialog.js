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

export const DialogContext = createContext()

export const DialogProvider = ({ children }) => {
  const { initialized: usersInitialized } = useContext(UserContext)

  const {
    playlist,
    startRandomPlaylist,
    initialized: galleryInitialized,
  } = useContext(GalleryContext)

  const { initialized: tangramsInitialized, approvedTangrams } = useContext(
    TangramsContext
  )

  const [initialized, setInitialized] = useState(false)

  const [profileDialogData, setProfileDialogData] = useState(null)

  const showProfile = useCallback((uid) => {
    const deferred = new Deferred()
    setProfileDialogData({ uid, deferred })
    return deferred.promise.finally(() => setProfileDialogData(null))
  }, [])

  const [leaderboardDeferred, setLeaderboardDeferred] = useState(null)

  const showLeaderboard = useCallback(() => {
    const deferred = new Deferred()
    setLeaderboardDeferred(deferred)
    return deferred.promise.finally(() => setLeaderboardDeferred(null))
  }, [])

  const [galleryDeferred, setGalleryDeferred] = useState(null)

  const showGallery = useCallback(() => {
    const deferred = new Deferred()
    setGalleryDeferred(deferred)
    return deferred.promise.finally(() => setGalleryDeferred(null))
  }, [])

  const [loginDeferred, setLoginDeferred] = useState(null)

  const showLogin = useCallback(() => {
    const deferred = new Deferred()
    setLoginDeferred(deferred)
    return deferred.promise.finally(() => setLoginDeferred(null))
  }, [])

  const [tangramDialogData, setTangramDialogData] = useState(null)

  const showTangram = useCallback((tangram) => {
    const deferred = new Deferred()
    setTangramDialogData({ deferred, tangram })
    return deferred.promise.finally(() => setTangramDialogData(null))
  }, [])

  const [settingsDialogDeferred, setSettingsDialogDeferred] = useState(null)

  const showSettings = useCallback(() => {
    const deferred = new Deferred()

    setSettingsDialogDeferred(deferred)

    return deferred.promise.finally(() => setSettingsDialogDeferred(null))
  }, [])

  const [challengeDialogData, setChallengeDialogData] = useState(null)

  useEffect(() => {
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
          const tangramIds = searchParams.get("tangrams").split(",")
          const uid = searchParams.get("uid")
          const challengeTangrams = approvedTangrams.filter((tangram) =>
            tangramIds.includes(tangram.id)
          )
          if (challengeTangrams.length) {
            hasBeenChallenged = true
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
            deferred.promise
              .catch((error) => {
                if (error instanceof Error) {
                  throw error
                }
                startRandomPlaylist(true)
              })
              .finally(() => setChallengeDialogData(null))
          }
        }
      }

      if (!hasBeenChallenged) {
        startRandomPlaylist(true)
      }

      setInitialized(true)
    }
  }, [tangramsInitialized, galleryInitialized, usersInitialized, initialized])

  const contextValue = useMemo(
    () => ({
      showProfile,
      showLeaderboard,
      showGallery,
      showLogin,
      showTangram,
      showSettings,
    }),
    [
      showProfile,
      showLeaderboard,
      showGallery,
      showLogin,
      showTangram,
      showSettings,
    ]
  )

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {loginDeferred && <LoginDialog deferred={loginDeferred}></LoginDialog>}
      {galleryDeferred && (
        <GalleryDialog deferred={galleryDeferred}></GalleryDialog>
      )}
      {tangramDialogData && (
        <TangramDialog {...tangramDialogData}></TangramDialog>
      )}
      {profileDialogData && (
        <ProfileDialog {...profileDialogData}></ProfileDialog>
      )}
      {leaderboardDeferred && (
        <LeaderboardDialog deferred={leaderboardDeferred}></LeaderboardDialog>
      )}
      {challengeDialogData && (
        <ChallengeDialog {...challengeDialogData}></ChallengeDialog>
      )}
      {settingsDialogDeferred && (
        <SettingsDialog deferred={settingsDialogDeferred}></SettingsDialog>
      )}
    </DialogContext.Provider>
  )
}
