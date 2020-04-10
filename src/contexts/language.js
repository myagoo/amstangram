import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react"
import translations from "../translations"
import { DEV } from "../constants"

const fallBackLanguage = "fr"

export const supportedLanguages = ["en", "fr"]

export const LanguageContext = createContext({
  language: fallBackLanguage,
  setLanguage: () => {},
})

export const useTranslate = () => {
  const { languageRef } = useContext(LanguageContext)
  return useCallback(
    (key, values) => {
      const language = languageRef.current
      if (!translations[language] || !translations[language][key]) {
        DEV && console.warn(`Key ${key} not found in language ${language}`)
        return key
      }

      if (!values) {
        return translations[language][key]
      }

      let interpolation = translations[language][key]
      for (const key in values) {
        interpolation = interpolation.replace(`{${key}}`, values[key])
      }

      return interpolation
    },
    [languageRef]
  )
}

const getDefaultLanguage = () => {
  const storedLanguage = localStorage.getItem("language")

  if (supportedLanguages.includes(storedLanguage)) {
    return storedLanguage
  }

  const preferedLanguages = navigator.languages

  for (const preferedLanguage of preferedLanguages) {
    const preferedSupportedLanguage = supportedLanguages.find(
      (supportedLanguage) => preferedLanguage.includes(supportedLanguage)
    )
    if (preferedSupportedLanguage) {
      return preferedSupportedLanguage
    }
  }

  return fallBackLanguage
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(fallBackLanguage)
  const languageRef = useRef(language)

  useEffect(() => {
    const defaultLanguage = getDefaultLanguage()
    setLanguage(defaultLanguage)
    languageRef.current = defaultLanguage
  }, [])

  const contextValue = useMemo(
    () => ({
      language,
      languageRef,
      setLanguage: (newLanguage) => {
        setLanguage(newLanguage)
        languageRef.current = newLanguage
      },
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}
