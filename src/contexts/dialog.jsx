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

export const DialogContext = createContext()

export const DialogProvider = ({ children }) => {
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

  const [profileDialogData, setProfileDialogData] = useState(null)

  const showProfile = useCallback(async (uid) => {
    const deferred = new Deferred()
    setProfileDialogData({ uid, deferred })
    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setProfileDialogData(null)
    }
  }, [])

  const [leaderboardDeferred, setLeaderboardDeferred] = useState(null)

  const showLeaderboard = useCallback(async () => {
    const deferred = new Deferred()
    setLeaderboardDeferred(deferred)

    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setLeaderboardDeferred(null)
    }
  }, [])

  const [menuDialogDeferred, setMenuDialogDeferred] = useState(null)

  const showMenu = useCallback(async () => {
    const deferred = new Deferred()

    setMenuDialogDeferred(deferred)
    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setMenuDialogDeferred(null)
    }
  }, [])

  const [galleryDeferred, setGalleryDeferred] = useState(null)

  const showGallery = useCallback(async () => {
    const deferred = new Deferred()
    setGalleryDeferred(deferred)

    try {
      await deferred.promise
      menuDialogDeferred.resolve()
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setGalleryDeferred(null)
    }
  }, [menuDialogDeferred])

  const [loginDeferred, setLoginDeferred] = useState(null)

  const showLogin = useCallback(async () => {
    const deferred = new Deferred()
    setLoginDeferred(deferred)
    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setLoginDeferred(null)
    }
  }, [])

  const [tangramDialogData, setTangramDialogData] = useState(null)

  const showTangram = useCallback(async (tangram) => {
    const deferred = new Deferred()
    setTangramDialogData({ deferred, tangram })
    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setTangramDialogData(null)
    }
  }, [])

  const [settingsDialogDeferred, setSettingsDialogDeferred] = useState(null)

  const showSettings = useCallback(async () => {
    const deferred = new Deferred()

    setSettingsDialogDeferred(deferred)

    try {
      await deferred.promise
    } catch (error) {
      if (error !== DIALOG_CLOSED_REASON) {
        throw error
      }
    } finally {
      setSettingsDialogDeferred(null)
    }
  }, [])

  const [challengeDialogData, setChallengeDialogData] = useState(null)

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
            const tangramIds = searchParams.get("tangrams").split(",")
            const uid = searchParams.get("uid")
            const challengeTangrams = approvedTangrams.filter((tangram) =>
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
      menuDialogDeferred,
      showMenu,
      showProfile,
      showLeaderboard,
      showGallery,
      showLogin,
      showTangram,
      showSettings,
    }
  }, [
    menuDialogDeferred,
    showMenu,
    showProfile,
    showLeaderboard,
    showGallery,
    showLogin,
    showTangram,
    showSettings,
  ])

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
      {menuDialogDeferred && (
        <MenuDialog deferred={menuDialogDeferred}></MenuDialog>
      )}
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
