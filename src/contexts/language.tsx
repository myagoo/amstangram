import React, { createContext, useEffect, useMemo, useState } from "react"
import { IntlProvider } from "react-intl"
import translations from "../translations"

const fallBackLanguage = "fr"

export const supportedLanguages = ["en", "fr"]

export const LanguageContext = createContext({
  language: fallBackLanguage,
  setLanguage: (_language: string) => { },
})

export const getDefaultLanguage = () => {
  const storedLanguage = localStorage.getItem("language")

  if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
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

export const LanguageProvider = ({ children }: React.PropsWithChildren) => {
  const [language, setLanguage] = useState(fallBackLanguage)

  useEffect(() => {
    const defaultLanguage = getDefaultLanguage()
    setLanguage(defaultLanguage)
  }, [])

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: (newLanguage: string) => {
        setLanguage(newLanguage)
        localStorage.setItem("language", newLanguage)
      },
    }),
    [language]
  )

  return (
    <IntlProvider
      locale={language}
      messages={translations[language as keyof typeof translations]}
      onError={console.warn}
    >
      <LanguageContext.Provider value={contextValue}>
        {children}
      </LanguageContext.Provider>
    </IntlProvider>
  )
}
