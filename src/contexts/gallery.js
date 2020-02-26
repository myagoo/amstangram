import React, { createContext, useCallback, useMemo, useState } from "react"

const GalleryContext = createContext({})

const GalleryProvider = ({ children }) => {
  const [tangrams, setTangrams] = useState([])
  const [galleryOpened, setGalleryOpened] = useState(false)
  const [selectedTangram, setSelectedTangram] = useState(null)
  const [requestId, setRequestId] = useState(0)

  const requestSave = useCallback(() => {
    setRequestId(prevRequestId => prevRequestId + 1)
  }, [])

  const onSaveRequest = useMemo(() => {
    if (requestId) {
      return tangram => setTangrams(prevTangrams => [...prevTangrams, tangram])
    }
  }, [requestId])

  const contextValue = useMemo(
    () => ({
      tangrams,
      selectedTangram,
      setSelectedTangram,
      requestSave,
      onSaveRequest,
      galleryOpened,
      setGalleryOpened,
    }),
    [
      tangrams,
      selectedTangram,
      requestSave,
      onSaveRequest,
      galleryOpened,
      setGalleryOpened,
    ]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}

export { GalleryProvider }
export { GalleryContext }
