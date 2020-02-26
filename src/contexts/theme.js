import React, { createContext, useMemo } from "react"

const theme = {
  space: [0, 8, 16, 32, 64, 128],
  colors: {
    st1: "#FECA57",
    st2: "#48DBFB",
    mt1: "#1DD1A1",
    lt1: "#FF6B6B",
    lt2: "#8557E0",
    sq: "#FF9FF3",
    rh: "#54A0FF",
    collision: "#bdc3c7",
    background: "#b7efe0",
  },
}

export const ThemeContext = createContext(theme)
export const ThemeProvider = ({ children }) => {
  const contextValue = useMemo(() => theme, [])
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
