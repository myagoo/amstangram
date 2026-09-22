import React, { createContext, useContext } from "react"
import { useStoredBoolean } from "../utils/useStoredBoolean"

export const ShowParticlesContext = createContext<[boolean, () => void]>([
  true,
  () => {
    /* No-op outside the provider. */
  },
])

export const useShowParticles = () => useContext(ShowParticlesContext)

export const ShowParticlesProvider = ({
  children,
}: React.PropsWithChildren) => {
  const value = useStoredBoolean("showParticles")
  return (
    <ShowParticlesContext.Provider value={value}>
      {children}
    </ShowParticlesContext.Provider>
  )
}
