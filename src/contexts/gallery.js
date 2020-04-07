import React, { createContext, useMemo, useState, useEffect } from "react"
import { GalleryDialog } from "../components/galleryDialog"

export const GalleryContext = createContext(null)

export const GalleryProvider = ({ children }) => {
  const [selectedTangrams, setSelectedTangrams] = useState([])
  const [galleryOpened, setGalleryOpened] = useState(false)

  useEffect(() => {
    setSelectedTangrams([])
  }, [galleryOpened])

  const contextValue = useMemo(
    () => ({
      selectedTangrams,
      setSelectedTangrams,
      galleryOpened,
      setGalleryOpened,
    }),
    [selectedTangrams, galleryOpened]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
      {galleryOpened && <GalleryDialog></GalleryDialog>}
    </GalleryContext.Provider>
  )
}
