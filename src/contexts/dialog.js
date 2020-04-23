import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
} from "react"
import { GalleryDialog } from "../components/galleryDialog"
import { LeaderboardDialog } from "../components/leaderboardDialog"
import { LoginDialog } from "../components/loginDialog"
import { ProfileDialog } from "../components/profileDialog"
import { TangramDialog } from "../components/tangramDialog"
import { Deferred } from "../utils/deferred"
import { UserContext } from "./user"
import { TangramsContext } from "./tangrams"
import { GalleryContext } from "./gallery"
import { shuffle } from "../utils/shuffle"
import { ChallengeDialog } from "../components/challengeDialog"

export const DialogContext = createContext()

export const DialogProvider = ({ children }) => {
  const [profileDialogData, setProfileDialogData] = useState(null)
  const [leaderboardDeferred, setLeaderboardDeferred] = useState(null)
  const [galleryDeferred, setGalleryDeferred] = useState(null)
  const [loginDeferred, setLoginDeferred] = useState(null)
  const [tangramDialogData, setTangramDialogData] = useState(null)
  const [challengeDialogData, setChallengeDialogData] = useState(null)

  const { currentUser } = useContext(UserContext)
  const { playlist, setPlaylist, completedTangrams } = useContext(
    GalleryContext
  )
  const tangrams = useContext(TangramsContext)
  const [initialized, setInitialized] = useState(false)

  const showProfile = useCallback((uid) => {
    const deferred = new Deferred()
    setProfileDialogData({ uid, deferred })
    return deferred.promise.finally(() => setProfileDialogData(null))
  }, [])

  const showLeaderboard = useCallback(() => {
    const deferred = new Deferred()
    setLeaderboardDeferred(deferred)
    return deferred.promise.finally(() => setLeaderboardDeferred(null))
  }, [])

  const showGallery = useCallback(() => {
    const deferred = new Deferred()
    setGalleryDeferred(deferred)
    return deferred.promise.finally(() => setGalleryDeferred(null))
  }, [])

  const showLogin = useCallback(() => {
    const deferred = new Deferred()

    setLoginDeferred(deferred)

    return deferred.promise.finally(() => setLoginDeferred(null))
  }, [])

  const showTangram = useCallback((tangram) => {
    const deferred = new Deferred()
    setTangramDialogData({ deferred, tangram })
    return deferred.promise.finally(() => setTangramDialogData(null))
  }, [])

  useEffect(() => {
    if (tangrams && currentUser !== undefined && !initialized) {
      let hasBeenChallenged = false

      const startRandomPlaylist = () =>
        setPlaylist(
          shuffle(tangrams).sort(({ id: idA }, { id: idB }) => {
            const isTangramACompleted = completedTangrams[idA] !== undefined
            const isTangramBCompleted = completedTangrams[idB] !== undefined
            return isTangramACompleted - isTangramBCompleted
          })
        )

      if (!playlist && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search)

        if (searchParams.has("tangrams")) {
          const tangramIds = searchParams.get("tangrams").split(",")
          const uid = searchParams.get("uid")
          const challengeTangrams = tangrams.filter((tangram) =>
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
                startRandomPlaylist()
              })
              .finally(() => setChallengeDialogData(null))
          }
        }
      }

      if (!hasBeenChallenged) {
        startRandomPlaylist()
      }

      setInitialized(true)
    }
  }, [
    tangrams,
    currentUser,
    initialized,
    playlist,
    setPlaylist,
    completedTangrams,
  ])

  const contextValue = useMemo(
    () => ({
      showProfile,
      showLeaderboard,
      showGallery,
      showLogin,
      showTangram,
    }),
    [showProfile, showLeaderboard, showGallery, showLogin, showTangram]
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
    </DialogContext.Provider>
  )
}
