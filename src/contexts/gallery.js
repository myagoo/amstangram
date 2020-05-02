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
            const isTangramACompleted =
              tangramsCompletedBy[idA][currentUser && currentUser.uid] !==
              undefined
            const isTangramBCompleted =
              tangramsCompletedBy[idB][currentUser && currentUser.uid] !==
              undefined
            return !isTangramACompleted && !isTangramBCompleted
              ? edgesB - edgesA
              : isTangramACompleted - isTangramBCompleted
          }
        : ({ id: idA }, { id: idB }) => {
            const isTangramACompleted =
              tangramsCompletedBy[idA][currentUser && currentUser.uid] !==
              undefined
            const isTangramBCompleted =
              tangramsCompletedBy[idB][currentUser && currentUser.uid] !==
              undefined
            return isTangramACompleted - isTangramBCompleted
          }

      const randomPlaylist = shuffle([...approvedTangrams]).sort(sortFn)
      setPlaylist([...randomPlaylist])
    },
    [approvedTangrams, tangramsCompletedBy, currentUser]
  )

  const markTangramAsComplete = useCallback(
    async (tangram, completionTime) => {
      if (
        currentUser &&
        tangram.approved &&
        !tangramsCompletedBy[tangram.id][currentUser.uid]
      ) {
        await firebase
          .firestore()
          .collection("stats")
          .doc(tangram.id)
          .update({
            [`${currentUser.uid}.completed`]: completionTime,
          })
      }
    },
    [currentUser, tangramsCompletedBy]
  )

  const toggleTangramStar = useCallback(
    async (tangram) => {
      if (currentUser && tangram.approved) {
        const starred = tangramsStarredBy[tangram.id][currentUser.uid]

        await firebase
          .firestore()
          .collection("stats")
          .doc(tangram.id)
          .update({
            [`${currentUser.uid}.starred`]: !starred,
          })
      }
    },
    [currentUser, tangramsStarredBy]
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
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}
