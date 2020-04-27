import React, { useContext, useState } from "react"
import {
  FiAward,
  FiGrid,
  FiMenu,
  FiSave,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi"
import { FADE_STAGGER_DURATION, FADE_TRANSITION_DURATION } from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { UserContext } from "../contexts/user"
import { Button } from "./button"
import { View } from "./view"

const DISTANCE = 100
const STEP_ANGLE = 45

export const TangramMenu = () => {
  const {
    showProfile,
    showLeaderboard,
    showGallery,
    showLogin,
    showSettings,
  } = useContext(DialogContext)
  const { currentUser } = useContext(UserContext)

  const [opened, setOpened] = useState(false)

  const { requestSave } = useContext(GalleryContext)

  const buttons = [
    <Button
      onClick={() => {
        showGallery()
      }}
    >
      <View as={FiGrid} css={{ m: "0 auto" }}></View>
    </Button>,

    <Button onClick={() => requestSave()}>
      <View as={FiSave} css={{ m: "0 auto" }}></View>
    </Button>,
    <Button onClick={() => showLeaderboard()}>
      <View as={FiAward} css={{ m: "0 auto" }}></View>
    </Button>,
    <Button
      onClick={() => {
        currentUser ? showProfile(currentUser.uid) : showLogin()
      }}
    >
      <View as={FiUser} css={{ m: "0 auto" }}></View>
    </Button>,
    <Button onClick={() => showSettings()}>
      <View as={FiSettings} css={{ m: "0 auto" }}></View>
    </Button>,
  ]

  return (
    <>
      <View
        css={{
          position: "fixed",
          bottom: 3,
          left: "50%",
          transform: "translateX(-50%)",
          animation: `${FADE_TRANSITION_DURATION}ms fadeIn ${FADE_STAGGER_DURATION}ms ease both`,
        }}
      >
        <View css={{ position: "relative" }}>
          {buttons.map((Component, index, { length }) => {
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
                key={index}
                css={{
                  transition: `all 100ms ease-in-out ${index * 50}ms`,
                  position: "absolute",
                }}
                style={style}
                onClick={() => setOpened(false)}
              >
                {Component}
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
    </>
  )
}
