import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from "react"
import { GalleryDialog } from "../components/galleryDialog"
import { SaveTangramDialog } from "../components/saveTangramDialog"
import { Deferred } from "../utils/deferred"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { sortTangrams } from "../utils/sortTangrams"
import { UserContext } from "./user"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext)

  const [galleryOpened, setGalleryOpened] = useState(false)

  const getTangramRef = useRef()
  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangramsEmoji, setCompletedTangramsEmoji] = useState({})
  const [tangramsByCategory, setTangramsByCategory] = useState(null)
  const [tangramDialogData, setTangramDialogData] = useState(null)
  const [tangrams, setTangrams] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("tangrams")
      .onSnapshot((querySnapshot) => {
        const newTangrams = []
        const newCompletedTangramsEmoji = {}

        for (const doc of querySnapshot.docs) {
          const id = doc.id
          const tangram = doc.data()
          newTangrams.push({
            id,
            difficulty: getTangramDifficulty(tangram),
            ...tangram,
          })
          newCompletedTangramsEmoji[id] = localStorage.getItem(id)
        }

        setTangrams(newTangrams)
        setCompletedTangramsEmoji(newCompletedTangramsEmoji)
      })

    return unsubscribe
  }, [])

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
      ].sort(sortTangrams)
    }

    setTangramsByCategory(sortedTangramsByCategory)
  }, [tangrams, currentUser])

  const requestSave = useCallback(() => {
    setSaveRequestId((prevRequestId) => prevRequestId + 1)
  }, [])

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
      tangramsByCategory,
      getTangramRef,
    }),
    [
      galleryOpened,
      completedTangramsEmoji,
      requestSave,
      saveRequestId,
      playlist,
      setCompletedTangramEmoji,
      tangramsByCategory,
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
