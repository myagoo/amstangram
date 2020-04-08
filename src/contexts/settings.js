import React, { createContext, useCallback, useMemo, useState } from "react"
import { SettingsDialog } from "../components/settingsDialog"
import { Deferred } from "../utils/deferred"

const DEFAULT_SETTINGS = { language: "en", theme: "light" }

export const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  showSettings: () => {},
})

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const [settingsDialogDeferred, setSettingsDialogDeferred] = useState(null)

  const showSettingsDialog = useCallback(() => {
    const deferred = new Deferred()

    setSettingsDialogDeferred(deferred)

    return deferred.promise.finally(() => setSettingsDialogDeferred(null))
  }, [])

  const contextValue = useMemo(
    () => ({
      settings,
      showSettingsDialog,
    }),
    [settings, showSettingsDialog]
  )

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
      {settingsDialogDeferred && (
        <SettingsDialog
          setSettings={setSettings}
          deferred={settingsDialogDeferred}
        ></SettingsDialog>
      )}
    </SettingsContext.Provider>
  )
}
