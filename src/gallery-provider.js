import React, { createContext, useCallback, useMemo, useState } from "react"

const GalleryContext = createContext(null)

const GalleryProvider = ({ children }) => {
  const [isGalleryOpened, setIsGalleryOpened] = useState(false)
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
      openGallery: () => setIsGalleryOpened(true),
      closeGallery: () => setIsGalleryOpened(false),
      isGalleryOpened,
    }),
    [tangrams, addToGallery, isGalleryOpened, selectedTangram]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}

export { GalleryProvider }
export { GalleryContext }
