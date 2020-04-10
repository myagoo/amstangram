import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, { useContext } from "react"
import { FiMoon, FiSun } from "react-icons/fi"
import {
  LanguageContext,
  supportedLanguages,
  useTranslate,
} from "../contexts/language"
import {
  DashedTangramIcon,
  FilledTangramIcon,
  useShowBackgroundPattern,
} from "../contexts/showBackgroundPattern"
import { DangerButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { Toggle } from "./toggle"
import { View } from "./view"

export const SettingsDialog = ({ deferred }) => {
  const [
    showBackgroundPattern,
    toggleShowBackgroundPattern,
  ] = useShowBackgroundPattern()

  const { language, setLanguage } = useContext(LanguageContext)
  const t = useTranslate()

  const [themeKey, switchTheme] = useSwitchTheme()

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value)
  }

  const handleResetClick = () => {
    if (
      window.confirm(
        t(
          "You are about to delete all your completion data. Are you sure you want to proceed ?"
        )
      )
    ) {
      window.localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <Dialog
      title={<Title>{t("Settings")}</Title>}
      onClose={deferred.reject}
      css={{ gap: 4, overflow: "auto", flex: "1", minWidth: "250px" }}
    >
      <View css={{ gap: 1 }}>
        <label>{t("Language")}</label>
        <Input as="select" onChange={handleLanguageChange} value={language}>
          {supportedLanguages.map((language) => (
            <option key={language} value={language}>
              {t(language)}
            </option>
          ))}
        </Input>
      </View>
      <View css={{ gap: 1 }}>
        <label>{t("Tangram mode")}</label>
        <Toggle
          value={showBackgroundPattern}
          onChange={toggleShowBackgroundPattern}
          leftComponent={<FilledTangramIcon />}
          leftValue={true}
          rightComponent={<DashedTangramIcon />}
          rightValue={false}
        ></Toggle>
      </View>
      <View css={{ gap: 1 }}>
        <label>{t("Theme")}</label>
        <Toggle
          value={themeKey}
          onChange={switchTheme}
          leftComponent={<View as={FiSun} css={{ size: 32 }}></View>}
          leftValue="light"
          rightComponent={<View as={FiMoon} css={{ size: 32 }}></View>}
          rightValue="dark"
        ></Toggle>
      </View>
      <DangerButton onClick={handleResetClick}>{t("Reset data")}</DangerButton>
    </Dialog>
  )
}
