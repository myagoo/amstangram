import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"
import { ThemeContext } from "css-system"

export const SwitchThemeContext = createContext(["", () => {}])

export const useSwitchTheme = () => useContext(SwitchThemeContext)

const STORAGE_KEY = "css-system-theme"

const baseTheme = {
  breakpoints: {
    s: "40em",
    m: "52em",
    l: "64em",
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    menu: 40,
    inline: 16,
    logo: 128,
    icon: 24,
    badge: 32,
    badgeBig: 86,
  },
  borderWidths: {
    loader: 8,
  },
  radii: [0, 4, 8, 16, 32],
  fontSizes: [10, 12, 14, 18, 22, 30, 46, 62, 70],
}

const THEMES = {
  light: {
    ...baseTheme,
    colors: {
      pieces: {
        st1: "#FECA57",
        st2: "#48DBFB",
        mt1: "#1DD1A1",
        lt1: "#FF6B6B",
        lt2: "#8557E0",
        sq: "#FF9FF3",
        rh: "#54A0FF",
      },
      difficulties: ["#10ac84", "#2e86de", "#ee5253"],
      shape: "#121212",
      background: "#fff",
      dialogBackground: "#d9d9d9",
      dialogText: "#303030",
      inputBackground: "#fff",
      errorText: "#bd0808",
      notificationBackground: "#FFFFFFdd",
    },
  },
  dark: {
    ...baseTheme,
    colors: {
      pieces: {
        st1: "#CE9518",
        st2: "#1CACCB",
        mt1: "#0CA57C",
        lt1: "#C33B3B",
        lt2: "#5C2DB9",
        sq: "#C95EBC",
        rh: "#2E75CF",
      },
      difficulties: ["#0b8767", "#1a6cbd", "#ce3737"],
      shape: "#595959",
      background: "#15141a",
      dialogBackground: "#383838",
      dialogText: "#d8d8d8",
      inputBackground: "#595959",
      errorText: "#e63c3c",
      notificationBackground: "#000000dd",
    },
  },
}

const DEFAULT_THEME = "light"

export const SwitchThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (THEMES[storedTheme]) {
      setThemeKey(storedTheme)
    }
  }, [])

  const switchTheme = useCallback(
    (newThemeKey) => {
      if (THEMES[newThemeKey]) {
        setThemeKey(newThemeKey)
        window.localStorage.setItem(STORAGE_KEY, newThemeKey)
      }
    },
    [THEMES]
  )

  const contextValue = useMemo(
    () => [themeKey, switchTheme],
    [themeKey, switchTheme]
  )

  return (
    <SwitchThemeContext.Provider value={contextValue}>
      <ThemeContext.Provider value={THEMES[themeKey]}>
        {children}
      </ThemeContext.Provider>
    </SwitchThemeContext.Provider>
  )
}
