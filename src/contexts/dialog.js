import React, { createContext, useCallback, useMemo, useState } from "react"
import { GalleryDialog } from "../components/galleryDialog"
import { LeaderboardDialog } from "../components/leaderboardDialog"
import { LoginDialog } from "../components/loginDialog"
import { ProfileDialog } from "../components/profileDialog"
import { TangramDialog } from "../components/tangramDialog"
import { Deferred } from "../utils/deferred"

export const DialogContext = createContext()

export const DialogProvider = ({ children }) => {
  const [profileDialogData, setProfileDialogData] = useState(null)
  const [leaderboardDeferred, setLeaderboardDeferred] = useState(null)
  const [galleryDeferred, setGalleryDeferred] = useState(null)
  const [loginDeferred, setLoginDeferred] = useState(null)
  const [tangramDialogData, setTangramDialogData] = useState(null)

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
    </DialogContext.Provider>
  )
}
