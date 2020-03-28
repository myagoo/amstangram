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

      for (const { percent, ...node } of nodes) {
        const difficulty = percent > 50 ? 0 : percent > 20 ? 1 : 2

        const tangram = {
          ...node,
          difficulty,
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

  const categories = useMemo(
    () => Object.keys(tangramsByGroup),
    // Do not add tangrams.group to deps because it change when a tangram is created
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const requestSave = useCallback(() => {
    setSaveRequestId(prevRequestId => prevRequestId + 1)
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
    setCompletedTangramsEmoji(prevCompletedTangrams => ({
      ...prevCompletedTangrams,
      [tangram.id]: emoji,
    }))
  }, [])

  const contextValue = useMemo(() => {
    return {
      completedTangramsEmoji,
      requestSave,
      saveRequestId,
      selectedTangrams,
      setCompletedTangramEmoji,
      setSelectedTangrams,
      tangramsByGroup,
      categories,
    }
  }, [
    completedTangramsEmoji,
    requestSave,
    saveRequestId,
    selectedTangrams,
    setCompletedTangramEmoji,
    tangramsByGroup,
    categories,
  ])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
