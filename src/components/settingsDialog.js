import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, { useContext } from "react"
import { FiMoon, FiSun, FiVolume2, FiVolumeX } from "react-icons/fi"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { LanguageContext, supportedLanguages } from "../contexts/language"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { SoundContext } from "../contexts/sound"
import { DangerButton, SecondaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { Text } from "./text"
import { Toggle } from "./toggle"
import { View } from "./view"
import { TipsContext } from "../contexts/tips"

export const SettingsDialog = ({ deferred }) => {
  const { soundEnabled, toggleSound } = useContext(SoundContext)
  const { tipsEnabled, toggleTips, resetTips } = useContext(TipsContext)
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
          leftComponent={
            <Text css={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "Easy" })}
            </Text>
          }
          leftValue={true}
          rightComponent={
            <Text css={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "Hard" })}
            </Text>
          }
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
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Show tips" })}</label>
        <Toggle
          value={tipsEnabled}
          onChange={toggleTips}
          leftComponent={
            <Text css={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "Yes" })}
            </Text>
          }
          leftValue={true}
          rightComponent={
            <Text css={{ fontWeight: 500 }}>
              {intl.formatMessage({ id: "No" })}
            </Text>
          }
          rightValue={false}
        ></Toggle>
      </View>
      <SecondaryButton onClick={resetTips}>
        {intl.formatMessage({ id: "Reset tips" })}
      </SecondaryButton>
    </Dialog>
  )
}
