import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
} from "react"

export const SoundContext = createContext([true, () => {}])

export const SoundProvider = ({ children }) => {
  const [soundsEnabled, setSoundsEnabled] = useState(true)

  useEffect(() => {
    setSoundsEnabled(
      window.localStorage.getItem("sounds") === "off" ? false : true
    )
  }, [])

  const toggleSounds = useCallback(() => {
    const newSoundsEnabled = !soundsEnabled
    setSoundsEnabled(newSoundsEnabled)
    window.localStorage.setItem("sounds", newSoundsEnabled ? "on" : "off")
  }, [soundsEnabled])

  const contextValue = useMemo(() => [soundsEnabled, toggleSounds], [
    soundsEnabled,
    toggleSounds,
  ])

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  )
}
