import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react"

export const DashedTangramIcon = (props) => {
  return (
    <svg
      viewBox="-30 -30 413.55 413.55"
      stroke="currentColor"
      strokeWidth="30"
      strokeLinejoin="round"
      strokeDasharray="60"
      fill="transparent"
      width="32"
      height="32"
      {...props}
    >
      <path d="M353.55339,302.84271l-70.71068,70.71068l-212.13203,0l-70.71068,-70.71068zM184.4269,282.84271v-141.42136l141.42136,-141.42136l0,141.42136z"></path>
    </svg>
  )
}

export const FilledTangramIcon = (props) => {
  return (
    <svg
      viewBox="-30 -30 413.55 413.55"
      stroke="currentColor"
      strokeWidth="30"
      strokeLinejoin="round"
      fill="currentColor"
      width="32"
      height="32"
      {...props}
    >
      <path d="M353.55339,302.84271l-70.71068,70.71068l-212.13203,0l-70.71068,-70.71068zM184.4269,282.84271v-141.42136l141.42136,-141.42136l0,141.42136z"></path>
    </svg>
  )
}

export const ShowBackgroundPatternContext = createContext([true, () => {}])

export const useShowBackgroundPattern = () =>
  useContext(ShowBackgroundPatternContext)

export const ShowBackgroundPatternProvider = ({ children }) => {
  const [showBackgroundPattern, setShowBackgroundPattern] = useState(true)

  useEffect(() => {
    const storedData = window.localStorage.getItem("showBackgroundPattern")
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

  const contextValue = useMemo(
    () => [showBackgroundPattern, toggleShowBackgroundPattern],
    [showBackgroundPattern, toggleShowBackgroundPattern]
  )

  return (
    <ShowBackgroundPatternContext.Provider value={contextValue}>
      {children}
    </ShowBackgroundPatternContext.Provider>
  )
}
