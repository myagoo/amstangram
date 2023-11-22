import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react"

export const ShowParticlesContext = createContext([true, () => {}])

export const useShowParticles = () =>
  useContext(ShowParticlesContext)

export const ShowParticlesProvider = ({ children }) => {
  const [showParticles, setShowParticles] = useState(true)

  useEffect(() => {
    const storedData = window.localStorage.getItem("showParticles")

    if (storedData === null) {
      setShowParticles(true)
      return
    }

    try {
      const storedShowParticles = JSON.parse(storedData)
      setShowParticles(!!JSON.parse(storedShowParticles))
    } catch (error) {
      window.localStorage.removeItem("showParticles")
    }
  }, [])

  const toggleShowParticles = useCallback(() => {
    const newShowParticles = !showParticles
    setShowParticles(newShowParticles)
    window.localStorage.setItem(
      "showParticles",
      JSON.stringify(newShowParticles)
    )
  }, [showParticles])

  const contextValue = useMemo(
    () => [showParticles, toggleShowParticles],
    [showParticles, toggleShowParticles]
  )

  return (
    <ShowParticlesContext.Provider value={contextValue}>
      {children}
    </ShowParticlesContext.Provider>
  )
}
