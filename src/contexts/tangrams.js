import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react"
import { useStaticQuery, graphql } from "gatsby"

export const TangramsContext = createContext({})

export const TangramsProvider = ({ children }) => {
  const [selectedTangrams, setSelectedTangrams] = useState([])
  const [saveRequestId, setSaveRequestId] = useState(0)
  const [completedTangramsEmoji, setCompletedTangramsEmoji] = useState({})

  const { svgs } = useStaticQuery(graphql`
    query GalleryQuery {
      svgs: allSvg {
        nodes {
          content
          id
        }
      }
    }
  `)

  const tangrams = useMemo(() => {
    return svgs.nodes
      .map(({ id, content }) => {
        const percent = content.match(/data-percent="(-?\d\d?\d?)"/)[1]
        const difficulty = percent > 50 ? 0 : percent > 20 ? 1 : 2
        return {
          id,
          difficulty,
          content,
        }
      })
      .sort(({ difficulty: difficultyA }, { difficulty: difficultyB }) => {
        return difficultyA - difficultyB
      })
  }, [svgs])

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
