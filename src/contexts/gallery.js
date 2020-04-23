import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { copyToClipboard } from "../utils/copyToClipboard"
import {
  sortDigitsTangrams,
  sortLettersTangrams,
  sortTangrams,
} from "../utils/sortTangrams"
import { useTranslate } from "./language"
import { NotifyContext } from "./notify"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const tangrams = useContext(TangramsContext)

  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangrams, setCompletedTangrams] = useState({})
  const [tangramsByCategory, setTangramsByCategory] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      setCompletedTangrams({})
      return
    }

    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .collection("tangrams")
      .onSnapshot((collectionSnapshot) => {
        const newCompletedTangrams = {}
        for (const doc of collectionSnapshot.docs) {
          const id = doc.id
          const completionStats = doc.data()
          newCompletedTangrams[id] = completionStats
        }
        setCompletedTangrams(newCompletedTangrams)
      })

    return unsubscribe
  }, [currentUser])

  useEffect(() => {
    if (tangrams === null) {
      return
    }

    const newTangramsByCategory = {}

    for (const tangram of tangrams) {
      if (tangram.uid && !tangram.approved) {
        if (
          !currentUser ||
          (!currentUser.isAdmin && tangram.uid !== currentUser.uid)
        ) {
          continue
        }
      }

      if (!newTangramsByCategory[tangram.category]) {
        newTangramsByCategory[tangram.category] = []
      }

      newTangramsByCategory[tangram.category].push(tangram)
    }

    const sortedTangramsByCategory = {}

    for (const sortedCategory of Object.keys(newTangramsByCategory).sort()) {
      sortedTangramsByCategory[sortedCategory] = newTangramsByCategory[
        sortedCategory
      ].sort(
        sortedCategory === "letters"
          ? sortLettersTangrams
          : sortedCategory === "digits"
          ? sortDigitsTangrams
          : sortTangrams
      )
    }

    setTangramsByCategory(sortedTangramsByCategory)
  }, [tangrams, currentUser])

  const shareTangrams = useCallback(
    (tangrams) => {
      let challengeLink = `${window.location.origin}/?tangrams=${tangrams
        .map(({ id }) => id)
        .join(",")}`
      if (currentUser) {
        challengeLink += `&uid=${currentUser.uid}`
      }
      copyToClipboard(challengeLink)
      notify(t("Challenge link copied to clipboard"))
    },
    [notify, t, currentUser]
  )

  const requestSave = useCallback(() => {
    setSaveRequestId((prevRequestId) => prevRequestId + 1)
  }, [])

  const markTangramAsComplete = useCallback(
    async (tangram, completionTime) => {
      if (currentUser) {
        const { exists } = await firebase
          .firestore()
          .collection("users")
          .doc(currentUser.uid)
          .collection("tangrams")
          .doc(tangram.id)
          .get()

        if (!exists)
          await firebase
            .firestore()
            .collection("users")
            .doc(currentUser.uid)
            .collection("tangrams")
            .doc(tangram.id)
            .set({
              completionTime,
            })
      }
    },
    [currentUser]
  )

  const contextValue = useMemo(
    () => ({
      requestSave,
      saveRequestId,
      playlist,
      setPlaylist,
      tangramsByCategory,
      markTangramAsComplete,
      completedTangrams,
      shareTangrams,
    }),
    [
      requestSave,
      saveRequestId,
      playlist,
      tangramsByCategory,
      markTangramAsComplete,
      completedTangrams,
      shareTangrams,
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}
