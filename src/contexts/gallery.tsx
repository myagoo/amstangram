import firebase from "../utils/firebase"

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

import type {
  SavedTangram,
  CompletionMap,
  StarMap,
  TangramStats,
} from "../types"
interface GalleryContextValue {
  initialized: boolean
  requestSave(): void
  saveRequestId: number
  playlist: SavedTangram[] | null
  currentTangramIndex: number
  advancePlaylist(): void
  setPlaylist: React.Dispatch<React.SetStateAction<SavedTangram[] | null>>
  shareTangrams(tangrams: SavedTangram[]): void
  startRandomPlaylist(sortDifficulty?: boolean): void
  tangramsCompletedBy: CompletionMap | null
  tangramsStarredBy: StarMap | null
  toggleTangramStar(tangram: SavedTangram): Promise<void>
  markTangramAsComplete(
    tangram: SavedTangram,
    completionTime: number
  ): Promise<void>
  isTangramCompleted(tangramId: string): boolean
  isTangramStarred(tangramId: string): boolean
}
export const GalleryContext = createContext<GalleryContextValue>(null!)

export const GalleryProvider = ({ children }: React.PropsWithChildren) => {
  const intl = useIntl()

  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const { approvedTangrams } = useContext(TangramsContext)

  const [tangramsCompletedBy, setTangramsCompletedBy] =
    useState<CompletionMap | null>(null)
  const [tangramsStarredBy, setTangramsLikedBy] = useState<StarMap | null>(null)

  const [{ playlist, currentTangramIndex }, setSession] = useState<{
    playlist: SavedTangram[] | null
    currentTangramIndex: number
  }>({ playlist: null, currentTangramIndex: 0 })
  const setPlaylist = useCallback<GalleryContextValue["setPlaylist"]>(
    (next) => {
      setSession((session) => ({
        playlist: typeof next === "function" ? next(session.playlist) : next,
        currentTangramIndex: 0,
      }))
    },
    []
  )
  const advancePlaylist = useCallback(() => {
    setSession((session) =>
      session.playlist &&
      session.currentTangramIndex < session.playlist.length - 1
        ? { ...session, currentTangramIndex: session.currentTangramIndex + 1 }
        : session
    )
  }, [])
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
        const newTangramsCompletedBy: CompletionMap = {}
        const newTangramsStarredBy: StarMap = {}

        for (const doc of collectionSnapshot.docs) {
          const tangramId = doc.id
          const tangramStats = doc.data() as TangramStats

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
    (tangramId: string) => {
      if (!currentUser || !tangramsStarredBy![tangramId]) {
        return false
      }
      return tangramsStarredBy![tangramId][currentUser.uid] === true
    },
    [currentUser, tangramsStarredBy]
  )

  const isTangramCompleted = useCallback(
    (tangramId: string) => {
      if (!currentUser || !tangramsCompletedBy![tangramId]) {
        return false
      }
      return tangramsCompletedBy![tangramId][currentUser.uid] !== undefined
    },
    [currentUser, tangramsCompletedBy]
  )

  const shareTangrams = useCallback(
    (tangrams: SavedTangram[]) => {
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
    (sortDifficulty?: boolean) => {
      const sortFn: (a: SavedTangram, b: SavedTangram) => number =
        sortDifficulty
          ? ({ id: idA, edges: edgesA }, { id: idB, edges: edgesB }) => {
              const isTangramACompleted = isTangramCompleted(idA)
              const isTangramBCompleted = isTangramCompleted(idB)
              return !isTangramACompleted && !isTangramBCompleted
                ? edgesB - edgesA
                : Number(isTangramACompleted) - Number(isTangramBCompleted)
            }
          : ({ id: idA }, { id: idB }) => {
              const isTangramACompleted = isTangramCompleted(idA)
              const isTangramBCompleted = isTangramCompleted(idB)
              return Number(isTangramACompleted) - Number(isTangramBCompleted)
            }

      const randomPlaylist = shuffle([...approvedTangrams!]).sort(sortFn)
      setPlaylist(randomPlaylist)
    },
    [approvedTangrams, isTangramCompleted, setPlaylist]
  )

  const markTangramAsComplete = useCallback(
    async (tangram: SavedTangram, completionTime: number) => {
      if (
        currentUser &&
        approvedTangrams!.some(
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
    async (tangram: SavedTangram) => {
      if (
        currentUser &&
        approvedTangrams!.some(
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
      currentTangramIndex,
      advancePlaylist,
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
      currentTangramIndex,
      advancePlaylist,
      setPlaylist,
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
