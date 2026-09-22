import React, { createContext, useContext } from "react"
import { useStoredBoolean } from "../utils/useStoredBoolean"

export const ShowBackgroundPatternContext = createContext<
  [boolean, () => void]
>([
  true,
  () => {
    /* No-op outside the provider. */
  },
])

export const useShowBackgroundPattern = () =>
  useContext(ShowBackgroundPatternContext)

export const ShowBackgroundPatternProvider = ({
  children,
}: React.PropsWithChildren) => {
  const value = useStoredBoolean("showBackgroundPattern")
  return (
    <ShowBackgroundPatternContext.Provider value={value}>
      {children}
    </ShowBackgroundPatternContext.Provider>
  )
}
