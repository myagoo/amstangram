import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { GalleryDialog } from "../components/galleryDialog"
import { TangramDialog } from "../components/tangramDialog"
import { Deferred } from "../utils/deferred"
import {
  sortTangrams,
  sortDigitsTangrams,
  sortLettersTangrams,
} from "../utils/sortTangrams"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"
import { ChallengeDialog } from "../components/challengeDialog"
import { copyToClipboard } from "../utils/copyToClipboard"
import { useTranslate } from "./language"
import { NotifyContext } from "./notify"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const tangrams = useContext(TangramsContext)
  const [initialized, setInitialized] = useState(false)

  const [galleryOpened, setGalleryOpened] = useState(false)

  const getTangramRef = useRef()
  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangrams, setCompletedTangrams] = useState({})
  const [tangramsByCategory, setTangramsByCategory] = useState(null)
  const [tangramDialogData, setTangramDialogData] = useState(null)
  const [challengeDialogData, setChallengeDialogData] = useState(null)

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

  useEffect(() => {
    if (tangrams && !initialized) {
      if (!playlist && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search)

        if (searchParams.has("tangrams")) {
          const tangramIds = searchParams.get("tangrams").split(",")
          const uid = searchParams.get("uid")
          const challengeTangrams = tangrams.filter((tangram) =>
            tangramIds.includes(tangram.id)
          )
          if (challengeTangrams.length) {
            const deferred = new Deferred()
            setChallengeDialogData({
              deferred,
              tangrams: challengeTangrams,
              uid,
            })
            deferred.promise.finally(() => setChallengeDialogData(null))
          }
        }
      }
      setInitialized(true)
    }
  }, [tangrams, initialized, playlist])

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

  getTangramRef.current = useCallback((tangram) => {
    const deferred = new Deferred()
    setTangramDialogData({ deferred, tangram })
    return deferred.promise.finally(() => setTangramDialogData(null))
  }, [])

  const contextValue = useMemo(
    () => ({
      galleryOpened,
      setGalleryOpened,
      requestSave,
      saveRequestId,
      playlist,
      setPlaylist,
      tangramsByCategory,
      getTangramRef,
      markTangramAsComplete,
      completedTangrams,
      shareTangrams,
    }),
    [
      galleryOpened,
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
      {galleryOpened && <GalleryDialog></GalleryDialog>}
      {tangramDialogData && (
        <TangramDialog {...tangramDialogData}></TangramDialog>
      )}
      {challengeDialogData && (
        <ChallengeDialog {...challengeDialogData}></ChallengeDialog>
      )}
    </GalleryContext.Provider>
  )
}
