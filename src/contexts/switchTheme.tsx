import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"
import { THEMES } from "../theme"
export type { AppTheme } from "../theme"

export const ThemeContext = createContext(THEMES.light)

export const SwitchThemeContext = createContext<[string, (key: string) => void]>(["", () => { /* No-op outside the provider. */ }])

export const useSwitchTheme = () => useContext(SwitchThemeContext)

const STORAGE_KEY = "css-system-theme"

const DEFAULT_THEME = "light"

export const SwitchThemeProvider = ({ children }: React.PropsWithChildren) => {
  const [themeKey, setThemeKey] = useState(DEFAULT_THEME)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (storedTheme === "light" || storedTheme === "dark") {
      setThemeKey(storedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = themeKey
  }, [themeKey])

  const switchTheme = useCallback(
    (newThemeKey: string) => {
      if (newThemeKey === "light" || newThemeKey === "dark") {
        setThemeKey(newThemeKey)
        window.localStorage.setItem(STORAGE_KEY, newThemeKey)
      }
    },
    []
  )

  const contextValue = useMemo<[string, (key: string) => void]>(
    () => [themeKey, switchTheme],
    [themeKey, switchTheme]
  )

  return (
    <SwitchThemeContext.Provider value={contextValue}>
      <ThemeContext.Provider value={THEMES[themeKey as keyof typeof THEMES]}>
        {children}
      </ThemeContext.Provider>
    </SwitchThemeContext.Provider>
  )
}
