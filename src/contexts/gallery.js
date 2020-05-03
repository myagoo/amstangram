import firebase from "gatsby-plugin-firebase"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useIntl } from "react-intl"
import { copyToClipboard } from "../utils/copyToClipboard"
import { shuffle } from "../utils/shuffle"
import { NotifyContext } from "./notify"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const intl = useIntl()

  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const { approvedTangrams } = useContext(TangramsContext)

  const [tangramsCompletedBy, setTangramsCompletedBy] = useState(null)
  const [tangramsStarredBy, setTangramsLikedBy] = useState(null)

  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (tangramsCompletedBy && tangramsStarredBy) {
      setInitialized(true)
    }
  }, [tangramsCompletedBy, tangramsStarredBy])

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("stats")
      .onSnapshot((collectionSnapshot) => {
        const newTangramsCompletedBy = {}
        const newTangramsStarredBy = {}

        for (const doc of collectionSnapshot.docs) {
          const tangramId = doc.id
          const tangramStats = doc.data()

          if (!newTangramsCompletedBy[tangramId]) {
            newTangramsCompletedBy[tangramId] = {}
            newTangramsStarredBy[tangramId] = {}
          }
          for (const userId in tangramStats) {
            newTangramsCompletedBy[tangramId][userId] =
              tangramStats[userId].completed
            newTangramsStarredBy[tangramId][userId] =
              tangramStats[userId].starred
          }
        }
        setTangramsCompletedBy(newTangramsCompletedBy)
        setTangramsLikedBy(newTangramsStarredBy)
      })

    return unsubscribe
  }, [])

  const isTangramStarred = useCallback(
    (tangramId) => {
      if (!currentUser || !tangramsStarredBy[tangramId]) {
        return false
      }
      return tangramsStarredBy[tangramId][currentUser.uid] === true
    },
    [currentUser, tangramsStarredBy]
  )

  const isTangramCompleted = useCallback(
    (tangramId) => {
      if (!currentUser || !tangramsCompletedBy[tangramId]) {
        return false
      }
      return tangramsCompletedBy[tangramId][currentUser.uid] !== undefined
    },
    [currentUser, tangramsCompletedBy]
  )

  const shareTangrams = useCallback(
    (tangrams) => {
      let challengeLink = `${window.location.origin}/?tangrams=${tangrams
        .map(({ id }) => id)
        .join(",")}`
      if (currentUser) {
        challengeLink += `&uid=${currentUser.uid}`
      }
      copyToClipboard(challengeLink)
      notify(intl.formatMessage({ id: "Challenge link copied to clipboard" }))
    },
    [notify, currentUser, intl]
  )

  const requestSave = useCallback(() => {
    setSaveRequestId((prevRequestId) => prevRequestId + 1)
  }, [])

  const startRandomPlaylist = useCallback(
    (sortDifficulty) => {
      const sortFn = sortDifficulty
        ? ({ id: idA, edges: edgesA }, { id: idB, edges: edgesB }) => {
            const isTangramACompleted = isTangramCompleted(idA)
            const isTangramBCompleted = isTangramCompleted(idB)
            return !isTangramACompleted && !isTangramBCompleted
              ? edgesB - edgesA
              : isTangramACompleted - isTangramBCompleted
          }
        : ({ id: idA }, { id: idB }) => {
            const isTangramACompleted = isTangramCompleted(idA)
            const isTangramBCompleted = isTangramCompleted(idB)
            return isTangramACompleted - isTangramBCompleted
          }

      const randomPlaylist = shuffle([...approvedTangrams]).sort(sortFn)
      setPlaylist(randomPlaylist)
    },
    [approvedTangrams, isTangramCompleted]
  )

  const markTangramAsComplete = useCallback(
    async (tangram, completionTime) => {
      if (
        currentUser &&
        approvedTangrams.some(
          (approvedTangram) => approvedTangram.id === tangram.id
        ) &&
        !isTangramCompleted(tangram.id)
      ) {
        await firebase
          .firestore()
          .collection("stats")
          .doc(tangram.id)
          .set(
            {
              [currentUser.uid]: {
                completed: completionTime,
              },
            },
            { merge: true }
          )
      }
    },
    [approvedTangrams, currentUser, isTangramCompleted]
  )

  const toggleTangramStar = useCallback(
    async (tangram) => {
      if (
        currentUser &&
        approvedTangrams.some(
          (approvedTangram) => approvedTangram.id === tangram.id
        )
      ) {
        const starred = isTangramStarred(tangram.id)

        await firebase
          .firestore()
          .collection("stats")
          .doc(tangram.id)
          .set(
            {
              [currentUser.uid]: {
                starred: !starred,
              },
            },
            { merge: true }
          )
      }
    },
    [approvedTangrams, currentUser, isTangramStarred]
  )

  const contextValue = useMemo(
    () => ({
      initialized,
      requestSave,
      saveRequestId,
      playlist,
      setPlaylist,
      shareTangrams,
      startRandomPlaylist,
      tangramsCompletedBy,
      tangramsStarredBy,
      toggleTangramStar,
      markTangramAsComplete,
      isTangramCompleted,
      isTangramStarred,
    }),
    [
      initialized,
      requestSave,
      saveRequestId,
      playlist,
      shareTangrams,
      startRandomPlaylist,
      tangramsCompletedBy,
      tangramsStarredBy,
      toggleTangramStar,
      markTangramAsComplete,
      isTangramCompleted,
      isTangramStarred,
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}
