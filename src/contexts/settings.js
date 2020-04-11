import React, { createContext, useCallback, useMemo, useState } from "react"
import { SettingsDialog } from "../components/settingsDialog"
import { Deferred } from "../utils/deferred"

export const SettingsContext = createContext({
  showSettings: () => {},
})

export const SettingsProvider = ({ children }) => {
  const [settingsDialogDeferred, setSettingsDialogDeferred] = useState(null)

  const showSettingsDialog = useCallback(() => {
    const deferred = new Deferred()

    setSettingsDialogDeferred(deferred)

    return deferred.promise.finally(() => setSettingsDialogDeferred(null))
  }, [])

  const contextValue = useMemo(
    () => ({
      showSettingsDialog,
    }),
    [showSettingsDialog]
  )

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
      {settingsDialogDeferred && (
        <SettingsDialog deferred={settingsDialogDeferred}></SettingsDialog>
      )}
    </SettingsContext.Provider>
  )
}
