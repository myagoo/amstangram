import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, { useContext } from "react"
import { FiMoon, FiSun, FiVolume2, FiVolumeX } from "react-icons/fi"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { LanguageContext, supportedLanguages } from "../contexts/language"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { SoundContext } from "../contexts/sound"
import { DangerButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { Text } from "./text"
import { Toggle } from "./toggle"
import { View } from "./view"

export const SettingsDialog = ({ deferred }) => {
  const { soundEnabled, toggleSound } = useContext(SoundContext)
  const [
    showBackgroundPattern,
    toggleShowBackgroundPattern,
  ] = useShowBackgroundPattern()

  const { language, setLanguage } = useContext(LanguageContext)
  const intl = useIntl()

  const [themeKey, switchTheme] = useSwitchTheme()

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value)
  }

  const handleResetClick = () => {
    if (
      window.confirm(
        intl.formatMessage({
          id:
            "You are about to reset your settings and tips. Are you sure you want to proceed ?",
        })
      )
    ) {
      window.localStorage.clear()
      window.location.reload(true)
    }
  }

  return (
    <Dialog
      title={<Title>{intl.formatMessage({ id: "Settings" })}</Title>}
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{ gap: 4, overflow: "auto", flex: "1", minWidth: "268px" }}
    >
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Language" })}</label>
        <Input as="select" onChange={handleLanguageChange} value={language}>
          {supportedLanguages.map((language) => (
            <option key={language} value={language}>
              {intl.formatMessage({ id: language })}
            </option>
          ))}
        </Input>
      </View>
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Difficulty" })}</label>
        <Toggle
          value={showBackgroundPattern}
          onChange={toggleShowBackgroundPattern}
          leftComponent={<Text>{intl.formatMessage({ id: "Easy" })}</Text>}
          leftValue={true}
          rightComponent={<Text>{intl.formatMessage({ id: "Hard" })}</Text>}
          rightValue={false}
        ></Toggle>
      </View>
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Theme" })}</label>
        <Toggle
          value={themeKey}
          onChange={switchTheme}
          leftComponent={<View as={FiSun} css={{ size: 32 }}></View>}
          leftValue="light"
          rightComponent={<View as={FiMoon} css={{ size: 32 }}></View>}
          rightValue="dark"
        ></Toggle>
      </View>
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Sounds" })}</label>
        <Toggle
          invertSounds
          value={soundEnabled}
          onChange={toggleSound}
          leftComponent={<View as={FiVolumeX} css={{ size: 32 }}></View>}
          leftValue={false}
          rightComponent={<View as={FiVolume2} css={{ size: 32 }}></View>}
          rightValue={true}
        ></Toggle>
      </View>
      <DangerButton onClick={handleResetClick}>
        {intl.formatMessage({ id: "Clear storage" })}
      </DangerButton>
    </Dialog>
  )
}
