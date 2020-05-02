import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, { useContext } from "react"
import { FiMoon, FiSun, FiVolume2, FiVolumeX } from "react-icons/fi"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { LanguageContext, supportedLanguages } from "../contexts/language"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { SoundContext } from "../contexts/sound"
import { TipsContext } from "../contexts/tips"
import { SecondaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { Text } from "./text"
import { Toggle } from "./toggle"
import { View } from "./view"

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
      css={{ gap: 4 }}
    >
      <View css={{ gap: 3 }}>
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
            leftComponent={<View as={FiSun} css={{ size: "icon" }}></View>}
            leftValue="light"
            rightComponent={<View as={FiMoon} css={{ size: "icon" }}></View>}
            rightValue="dark"
          ></Toggle>
        </View>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Sounds" })}</label>
          <Toggle
            invertSounds
            value={soundEnabled}
            onChange={toggleSound}
            leftComponent={<View as={FiVolumeX} css={{ size: "icon" }}></View>}
            leftValue={false}
            rightComponent={<View as={FiVolume2} css={{ size: "icon" }}></View>}
            rightValue={true}
          ></Toggle>
        </View>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Show tips" })}</label>
          <Toggle
            value={tipsEnabled}
            onChange={toggleTips}
            leftComponent={<Text>{intl.formatMessage({ id: "Yes" })}</Text>}
            leftValue={true}
            rightComponent={<Text>{intl.formatMessage({ id: "No" })}</Text>}
            rightValue={false}
          ></Toggle>
        </View>
      </View>
      <SecondaryButton onClick={resetTips}>
        {intl.formatMessage({ id: "Reset tips" })}
      </SecondaryButton>
    </Dialog>
  )
}
