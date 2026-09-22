import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react"

export const ShowBackgroundPatternContext = createContext<[boolean, () => void]>([true, () => { /* No-op outside the provider. */ }])

export const useShowBackgroundPattern = () =>
  useContext(ShowBackgroundPatternContext)

export const ShowBackgroundPatternProvider = ({ children }: React.PropsWithChildren) => {
  const [showBackgroundPattern, setShowBackgroundPattern] = useState(true)

  useEffect(() => {
    const storedData = window.localStorage.getItem("showBackgroundPattern")

    if (storedData === null) {
      setShowBackgroundPattern(true)
      return
    }

    try {
      const storedShowBackgroundPattern = JSON.parse(storedData)
      setShowBackgroundPattern(!!JSON.parse(storedShowBackgroundPattern))
    } catch (error) {
      window.localStorage.removeItem("showBackgroundPattern")
    }
  }, [])

  const toggleShowBackgroundPattern = useCallback(() => {
    const newShowBackgroundPattern = !showBackgroundPattern
    setShowBackgroundPattern(newShowBackgroundPattern)
    window.localStorage.setItem(
      "showBackgroundPattern",
      JSON.stringify(newShowBackgroundPattern)
    )
  }, [showBackgroundPattern])

  const contextValue = useMemo<[boolean, () => void]>(
    () => [showBackgroundPattern, toggleShowBackgroundPattern],
    [showBackgroundPattern, toggleShowBackgroundPattern]
  )

  return (
    <ShowBackgroundPatternContext.Provider value={contextValue}>
      {children}
    </ShowBackgroundPatternContext.Provider>
  )
}
