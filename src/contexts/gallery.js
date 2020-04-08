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
import { SaveTangramDialog } from "../components/saveTangramDialog"
import { Deferred } from "../utils/deferred"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { UserContext } from "./user"
import { sortTangrams } from "../utils/sortTangrams"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const [galleryOpened, setGalleryOpened] = useState(false)

  const { currentUser } = useContext(UserContext)
  const getTangramRef = useRef()
  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangramsEmoji, setCompletedTangramsEmoji] = useState({})
  const [pendingTangrams, setPendingTangrams] = useState([])
  const [baseTangramsByGroup, setBaseTangramsByGroup] = useState(null)
  const [communityTangramsByUser, setCommunityTangramsByUser] = useState(null)
  const [tangramDialogData, setTangramDialogData] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("baseTangrams")
      .onSnapshot((querySnapshot) => {
        const baseTangramsByGroup = {}

        for (const doc of querySnapshot.docs) {
          const tangram = doc.data()
          if (!baseTangramsByGroup[tangram.category]) {
            baseTangramsByGroup[tangram.category] = []
          }
          baseTangramsByGroup[tangram.category].push({
            id: doc.id,
            difficulty: getTangramDifficulty(tangram),
            ...tangram,
          })
        }

        const sortedBaseTangramsByGroup = {}
        for (const sortedCategory of Object.keys(baseTangramsByGroup).sort()) {
          sortedBaseTangramsByGroup[sortedCategory] = baseTangramsByGroup[
            sortedCategory
          ].sort(sortTangrams)
        }

        setBaseTangramsByGroup(sortedBaseTangramsByGroup)
      })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("communityTangrams")
      .where("approved", "==", true)
      .onSnapshot((querySnapshot) => {
        const baseTangramsByUser = {}
        for (const doc of querySnapshot.docs) {
          const tangram = doc.data()
          if (!baseTangramsByUser[tangram.uid]) {
            baseTangramsByUser[tangram.uid] = []
          }
          baseTangramsByUser[tangram.uid].push({
            id: doc.id,
            difficulty: getTangramDifficulty(tangram),
            ...tangram,
          })
        }

        const sortedBaseTangramsByUser = {}
        for (const sortedCategory of Object.keys(baseTangramsByUser).sort(
          (tangramsA, tangramsB) => tangramsA.length - tangramsB.length
        )) {
          sortedBaseTangramsByUser[sortedCategory] = baseTangramsByUser[
            sortedCategory
          ].sort(sortTangrams)
        }

        setCommunityTangramsByUser(sortedBaseTangramsByUser)
      })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      return
    }
    let ref = firebase
      .firestore()
      .collection("communityTangrams")
      .where("approved", "==", false)

    if (!currentUser.isAdmin) {
      ref = ref.where("uid", "==", currentUser.uid)
    }

    const unsubscribe = ref.onSnapshot((querySnapshot) => {
      setPendingTangrams(
        querySnapshot.docs.map((doc) => {
          const tangram = doc.data()
          return {
            id: doc.id,
            difficulty: getTangramDifficulty(tangram),
            ...tangram,
          }
        })
      )

      return () => {
        setPendingTangrams([])
        unsubscribe()
      }
    })
  }, [currentUser])

  const requestSave = useCallback(() => {
    setSaveRequestId((prevRequestId) => prevRequestId + 1)
  }, [])

  useEffect(() => {
    if (baseTangramsByGroup === null || communityTangramsByUser === null) {
      return
    }

    const newCompletedTangramsEmoji = {}

    for (const category in baseTangramsByGroup) {
      const tangrams = baseTangramsByGroup[category]
      for (const { id } of tangrams) {
        newCompletedTangramsEmoji[id] = localStorage.getItem(id)
      }
    }

    for (const userId in communityTangramsByUser) {
      const tangrams = communityTangramsByUser[userId]
      for (const { id } of tangrams) {
        newCompletedTangramsEmoji[id] = localStorage.getItem(id)
      }
    }

    setCompletedTangramsEmoji(newCompletedTangramsEmoji)
  }, [baseTangramsByGroup, communityTangramsByUser])

  const setCompletedTangramEmoji = useCallback((tangram, emoji) => {
    localStorage.setItem(tangram.id, emoji)

    setCompletedTangramsEmoji((prevCompletedTangrams) => ({
      ...prevCompletedTangrams,
      [tangram.id]: emoji,
    }))
  }, [])

  getTangramRef.current = useCallback((pathData) => {
    const deferred = new Deferred()
    setTangramDialogData({ deferred, pathData })
    return deferred.promise.finally(() => setTangramDialogData(null))
  }, [])

  const contextValue = useMemo(
    () => ({
      galleryOpened,
      setGalleryOpened,
      completedTangramsEmoji,
      requestSave,
      saveRequestId,
      playlist,
      setCompletedTangramEmoji,
      setPlaylist,
      baseTangramsByGroup,
      communityTangramsByUser,
      getTangramRef,
      pendingTangrams,
    }),
    [
      galleryOpened,
      completedTangramsEmoji,
      requestSave,
      saveRequestId,
      playlist,
      setCompletedTangramEmoji,
      baseTangramsByGroup,
      communityTangramsByUser,
      pendingTangrams,
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
      {galleryOpened && <GalleryDialog></GalleryDialog>}
      {tangramDialogData && (
        <SaveTangramDialog {...tangramDialogData}></SaveTangramDialog>
      )}
    </GalleryContext.Provider>
  )
}
