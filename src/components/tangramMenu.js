import React, { useState, useContext } from "react"
import {
  FiMenu,
  FiX,
  FiGrid,
  FiSquare,
  FiSave,
  FiMoon,
  FiSun,
} from "react-icons/fi"
import {
  FADEIN_STAGGER_DURATION,
  FADEIN_TRANSITION_DURATION,
} from "../constants"
import { Button } from "./button"
import { View } from "./view"
import { GalleryContext } from "../contexts/gallery"
import {
  useShowBackgroundPattern,
  FilledTangramIcon,
  DashedTangramIcon,
} from "../contexts/showBackgroundPattern"
import { TangramsContext } from "../contexts/tangrams"
import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import { NotifyContext } from "../contexts/notify"

const DISTANCE = 100
const STEP_ANGLE = 60

export const TangramMenu = () => {
  const notify = useContext(NotifyContext)

  const [themeKey, switchTheme] = useSwitchTheme()
  const [opened, setOpened] = useState(false)
  const [
    showBackgroundPattern,
    toggleShowBackgroundPattern,
  ] = useShowBackgroundPattern()

  const { requestSave, playlist, setPlaylist } = useContext(TangramsContext)

  const { setGalleryOpened } = useContext(GalleryContext)

  const handleClick = (event, onClick) => {
    onClick(event)
    setOpened(false)
  }

  const actions = [
    {
      id: "gallery",
      icon: FiGrid,
      onClick: () =>
        setGalleryOpened((prevGalleryOpened) => !prevGalleryOpened),
    },
    {
      id: "mode",
      icon: showBackgroundPattern ? FilledTangramIcon : DashedTangramIcon,
      onClick: () => {
        toggleShowBackgroundPattern()
        notify(showBackgroundPattern ? "Realistic mode" : "Arcade mode")
      },
    },
    {
      id: "stop",
      icon: playlist ? FiSquare : FiSave,
      onClick: playlist ? () => setPlaylist(null) : requestSave,
    },
    {
      id: "theme",
      icon: themeKey === "dark" ? FiMoon : FiSun,
      onClick: () => {
        switchTheme(themeKey === "dark" ? "light" : "dark")
        notify(themeKey === "dark" ? "Light mode" : "Dark mode")
      },
    },
  ]

  return (
    <View
      css={{
        position: "fixed",
        bottom: 3,
        left: "50%",
        transform: "translateX(-50%)",
        animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${
          FADEIN_STAGGER_DURATION * 2
        }ms ease both`,
      }}
    >
      <View css={{ position: "relative" }}>
        {actions
          .filter(({ visible }) => visible !== false)
          .map(({ id, icon, onClick, disabled }, index, { length }) => {
            const startAngle = length % 2 !== 0 ? 180 : 180 - STEP_ANGLE / 2

            const realIndex = Math.ceil(index / 2)
            const isOdd = index % 2
            const angle =
              ((startAngle + realIndex * (isOdd ? STEP_ANGLE : -STEP_ANGLE)) *
                Math.PI) /
              180
            const left = DISTANCE * Math.cos(angle)
            const top = DISTANCE * Math.sin(angle)

            const style = opened
              ? {
                  opacity: 1,
                  top: `${left}px`,
                  left: `${top}px`,
                }
              : {
                  opacity: 0,
                  top: `0px`,
                  left: `0px`,
                }

            return (
              <View
                key={id}
                css={{
                  transition: `all 100ms ease-in-out ${index * 50}ms`,
                  position: "absolute",
                }}
                style={style}
              >
                <Button
                  onClick={(e) => handleClick(e, onClick)}
                  disabled={disabled}
                >
                  <View as={icon} css={{ m: "auto" }}></View>
                </Button>
              </View>
            )
          })}

        <View css={{ zIndex: 1 }}>
          <Button onClick={() => setOpened(!opened)}>
            <View as={opened ? FiX : FiMenu} css={{ m: "auto" }}></View>
          </Button>
        </View>
      </View>
    </View>
  )
}
