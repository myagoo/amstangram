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

import { NotifyContext } from "./notify"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"
import { shuffle } from "../utils/shuffle"
import { useIntl } from "react-intl"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const intl = useIntl()

  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const { approvedTangrams } = useContext(TangramsContext)

  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [stats, setStats] = useState(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("stats")
      .onSnapshot((collectionSnapshot) => {
        const newStats = {}
        for (const doc of collectionSnapshot.docs) {
          const id = doc.id
          const completionStats = doc.data()
          newStats[id] = completionStats
        }
        setStats(newStats)
      })

    return unsubscribe
  }, [])

  const completedTangrams = useMemo(() => {
    if (!approvedTangrams || !stats) {
      return null
    }

    const approvedTangramsIds = approvedTangrams.map(({ id }) => id)

    let newCompletedTangrams = {}

    for (const userId in stats) {
      if (!newCompletedTangrams[userId]) {
        newCompletedTangrams[userId] = {}
      }
      for (const tangramId in stats[userId]) {
        if (approvedTangramsIds.includes(tangramId)) {
          newCompletedTangrams[userId][tangramId] = stats[userId][tangramId]
        }
      }
    }
    return newCompletedTangrams
  }, [stats, approvedTangrams])

  useEffect(() => {
    if (completedTangrams) {
      setInitialized(true)
    }
  }, [completedTangrams])

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

  const markTangramAsComplete = useCallback(
    async (tangram, completionTime) => {
      if (currentUser && tangram.approved && !completedTangrams[tangram.id]) {
        await firebase
          .firestore()
          .collection("stats")
          .doc(currentUser.uid)
          .set(
            {
              [tangram.id]: { completionTime },
            },
            { merge: true }
          )
      }
    },
    [currentUser, completedTangrams]
  )

  const startRandomPlaylist = useCallback(() => {
    let currentUserCompletedTangrams =
      currentUser != null && completedTangrams[currentUser.uid]
        ? completedTangrams[currentUser.uid]
        : {}

    const randomPlaylist = shuffle([...approvedTangrams]).sort(
      ({ id: idA, edges: edgesA }, { id: idB, edges: edgesB }) => {
        const isTangramACompleted =
          currentUserCompletedTangrams[idA] !== undefined
        const isTangramBCompleted =
          currentUserCompletedTangrams[idB] !== undefined
        return !isTangramACompleted && !isTangramBCompleted
          ? edgesB - edgesA
          : isTangramACompleted - isTangramBCompleted
      }
    )
    setPlaylist([...randomPlaylist])
  }, [approvedTangrams, completedTangrams, currentUser])

  const contextValue = useMemo(
    () => ({
      initialized,
      requestSave,
      saveRequestId,
      playlist,
      setPlaylist,
      markTangramAsComplete,
      completedTangrams,
      shareTangrams,
      startRandomPlaylist,
    }),
    [
      initialized,
      requestSave,
      saveRequestId,
      playlist,
      markTangramAsComplete,
      completedTangrams,
      shareTangrams,
      startRandomPlaylist,
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}
