import React, { useContext, useState } from "react"
import {
  FiGrid,
  FiLogIn,
  FiMenu,
  FiSave,
  FiSettings,
  FiSquare,
  FiUser,
  FiX,
} from "react-icons/fi"
import { FADE_STAGGER_DURATION, FADE_TRANSITION_DURATION } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { SettingsContext } from "../contexts/settings"
import { UserContext } from "../contexts/user"
import { Button } from "./button"
import { View } from "./view"

const DISTANCE = 100
const STEP_ANGLE = 45

export const TangramMenu = () => {
  const { showSettingsDialog } = useContext(SettingsContext)
  const { currentUser, login, showProfile } = useContext(UserContext)

  const [opened, setOpened] = useState(false)

  const { requestSave, playlist, setPlaylist } = useContext(GalleryContext)

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
      id: "stop",
      icon: playlist ? FiSquare : FiSave,
      onClick: playlist ? () => setPlaylist(null) : requestSave,
    },
    {
      id: "settings",
      icon: FiSettings,
      onClick: () => showSettingsDialog(),
    },
    {
      id: "user",
      icon: currentUser ? FiUser : FiLogIn,
      onClick: async () => {
        if (currentUser) {
          showProfile(currentUser.uid)
        } else {
          login()
        }
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
        animation: `${FADE_TRANSITION_DURATION}ms fadeIn ${
          FADE_STAGGER_DURATION * 2
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
