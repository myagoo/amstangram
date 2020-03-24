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

  const { tangramsJson } = useStaticQuery(graphql`
    query GalleryQuery {
      tangramsJson: allTangramsJson {
        nodes {
          path
          id
          percent
          width
          height
        }
      }
    }
  `)

  const tangrams = useMemo(() => {
    return tangramsJson.nodes
      .map(({ percent, ...node }) => {
        const difficulty = percent > 50 ? 0 : percent > 20 ? 1 : 2
        return {
          ...node,
          difficulty,
        }
      })
      .sort(({ difficulty: difficultyA }, { difficulty: difficultyB }) => {
        return difficultyA - difficultyB
      })
  }, [tangramsJson])

  const requestSave = useCallback(() => {
    setSaveRequestId(prevRequestId => prevRequestId + 1)
  }, [])

  useEffect(() => {
    const newCompletedTangramsEmoji = {}
    for (const { id } of tangrams) {
      newCompletedTangramsEmoji[id] = localStorage.getItem(id)
    }
    setCompletedTangramsEmoji(newCompletedTangramsEmoji)
  }, [tangrams])

  const setCompletedTangramEmoji = useCallback((tangram, emoji) => {
    localStorage.setItem(tangram.id, emoji)
    setCompletedTangramsEmoji(prevCompletedTangrams => ({
      ...prevCompletedTangrams,
      [tangram.id]: emoji,
    }))
  }, [])

  const contextValue = useMemo(() => {
    return {
      tangrams,
      selectedTangrams,
      setSelectedTangrams,
      requestSave,
      saveRequestId,
      completedTangramsEmoji,
      setCompletedTangramEmoji,
    }
  }, [
    tangrams,
    selectedTangrams,
    requestSave,
    saveRequestId,
    completedTangramsEmoji,
    setCompletedTangramEmoji,
  ])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
