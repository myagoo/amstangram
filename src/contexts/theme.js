import React from "react"
import { ThemeContext } from "@css-system/use-css"

const theme = {
  breakpoints: {
    s: "40em",
    m: "52em",
    l: "64em",
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
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

export const ThemeProvider = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
