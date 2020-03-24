import { graphql, useStaticQuery } from "gatsby"
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

export const TangramsContext = createContext({})

export const TangramsProvider = ({ children }) => {
  const [selectedTangrams, setSelectedTangrams] = useState([])
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangramsEmoji, setCompletedTangramsEmoji] = useState({})

  const { tangrams } = useStaticQuery(graphql`
    fragment TangramFragment on TangramsJson {
      path
      id
      percent
      width
      height
      emoji
    }

    query GalleryQuery {
      tangrams: allTangramsJson {
        group(field: category) {
          fieldValue
          nodes {
            ...TangramFragment
          }
        }
        nodes {
          ...TangramFragment
        }
      }
    }
  `)

  const requestSave = useCallback(() => {
    setSaveRequestId(prevRequestId => prevRequestId + 1)
  }, [])

  const finishSave = useCallback(() => {
    setSaveRequestId(prevRequestId => prevRequestId - 1)
  }, [])

  useEffect(() => {
    const newCompletedTangramsEmoji = {}
    for (const { id } of tangrams.nodes) {
      newCompletedTangramsEmoji[id] = localStorage.getItem(id)
    }
    setCompletedTangramsEmoji(newCompletedTangramsEmoji)
  }, [tangrams.nodes])

  const setCompletedTangramEmoji = useCallback((tangram, emoji) => {
    localStorage.setItem(tangram.id, emoji)
    setCompletedTangramsEmoji(prevCompletedTangrams => ({
      ...prevCompletedTangrams,
      [tangram.id]: emoji,
    }))
  }, [])

  const contextValue = useMemo(() => {
    return {
      completedTangramsEmoji,
      finishSave,
      requestSave,
      saveRequestId,
      selectedTangrams,
      setCompletedTangramEmoji,
      setSelectedTangrams,
      tangrams,
    }
  }, [
    completedTangramsEmoji,
    finishSave,
    requestSave,
    saveRequestId,
    selectedTangrams,
    setCompletedTangramEmoji,
    tangrams,
  ])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
