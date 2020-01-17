import React, { createContext, useCallback, useMemo, useState } from "react"

const GalleryContext = createContext(null)

const GalleryProvider = ({ children }) => {
  const [tangrams, setTangrams] = useState([])
  const [selectedTangram, setSelectedTangram] = useState(null)

  const addToGallery = useCallback(tangram => {
    setTangrams(tangrams => [...tangrams, tangram])
  }, [])

  const contextValue = useMemo(
    () => ({
      tangrams,
      addToGallery,
      selectedTangram,
      setSelectedTangram,
    }),
    [tangrams, addToGallery, selectedTangram]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}

export { GalleryProvider }
export { GalleryContext }
