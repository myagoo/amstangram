import { graphql, useStaticQuery } from "gatsby"
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { SaveTangramDialog } from "../components/saveTangramDialog"
import { Deferred } from "../utils/deferred"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"

export const TangramsContext = createContext({})

export const TangramsProvider = ({ children }) => {
  const getTangramRef = useRef()
  const [playlist, setPlaylist] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangramsEmoji, setCompletedTangramsEmoji] = useState({})
  const [tangramDialogData, setTangramDialogData] = useState(null)

  const {
    data: { group: groups },
  } = useStaticQuery(graphql`
    fragment TangramFragment on TangramsJson {
      id
      emoji
      height
      order
      path
      percent
      width
      category
      label
      parent {
        ... on File {
          name
        }
      }
    }

    query GalleryQuery {
      data: allTangramsJson {
        group(field: category) {
          fieldValue
          nodes {
            ...TangramFragment
          }
        }
      }
    }
  `)

  const tangramsByGroup = useMemo(() => {
    const tangramsByGroup = {}

    for (const { fieldValue, nodes } of groups) {
      tangramsByGroup[fieldValue] = []

      for (const node of nodes) {
        const tangram = {
          ...node,
          difficulty: getTangramDifficulty(node),
        }
        tangramsByGroup[fieldValue].push(tangram)
      }

      tangramsByGroup[fieldValue].sort((tangramA, tangramB) => {
        return tangramA.order && tangramB.order
          ? tangramA.order - tangramB.order
          : tangramA.difficulty - tangramB.difficulty
      })
    }
    return tangramsByGroup
  }, [groups])

  const requestSave = useCallback(() => {
    setSaveRequestId((prevRequestId) => prevRequestId + 1)
  }, [])

  useEffect(() => {
    const newCompletedTangramsEmoji = {}
    for (const category in tangramsByGroup) {
      const tangrams = tangramsByGroup[category]
      for (const { id } of tangrams) {
        newCompletedTangramsEmoji[id] = localStorage.getItem(id)
      }
    }
    setCompletedTangramsEmoji(newCompletedTangramsEmoji)
  }, [tangramsByGroup])

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

  const contextValue = useMemo(() => {
    return {
      completedTangramsEmoji,
      requestSave,
      saveRequestId,
      playlist,
      setCompletedTangramEmoji,
      setPlaylist,
      tangramsByGroup,
      getTangramRef,
    }
  }, [
    completedTangramsEmoji,
    requestSave,
    saveRequestId,
    playlist,
    setCompletedTangramEmoji,
    tangramsByGroup,
  ])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
      {tangramDialogData && (
        <SaveTangramDialog {...tangramDialogData}></SaveTangramDialog>
      )}
    </TangramsContext.Provider>
  )
}
