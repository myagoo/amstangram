import React, { createContext, useCallback, useMemo, useState } from "react"

const GalleryContext = createContext({})

const GalleryProvider = ({ children }) => {
  const [selectedTangram, setSelectedTangram] = useState(null)
  const [saveRequestId, setSaveRequestId] = useState(0)

  const requestSave = useCallback(() => {
    setSaveRequestId(prevRequestId => prevRequestId + 1)
  }, [])

  const contextValue = useMemo(
    () => ({
      selectedTangram,
      setSelectedTangram,
      requestSave,
      saveRequestId,
    }),
    [selectedTangram, requestSave, saveRequestId]
  )

  return (
    <GalleryContext.Provider value={contextValue}>
      {children}
    </GalleryContext.Provider>
  )
}

export { GalleryProvider }
export { GalleryContext }
