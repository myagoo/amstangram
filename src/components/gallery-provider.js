import React, { createContext, useCallback, useMemo, useState } from "react"

const GalleryContext = createContext(null)

const GalleryProvider = ({ children }) => {
  const [tangrams, setTangrams] = useState([])
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
    }),
    [tangrams, selectedTangram, requestSave, onSaveRequest]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}

export { GalleryProvider }
export { GalleryContext }
