import React, { useContext, useEffect, useState } from "react"
import { useIntl } from "react-intl"
import { Logo } from "./logo"
import { View } from "./view"
import { FADE_TRANSITION_DURATION } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { NotifyContext } from "../contexts/notify"
import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { Menu } from "./menu"
import { Title } from "./primitives"
import { Tangram } from "./tangram"

export const App = () => {
  const intl = useIntl()
  const notify = useContext(NotifyContext)
  const [waited, setWaited] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [showLoaderTimeout, setShowLoaderTimeout] = useState<number>()
  const [initialized, setInitialized] = useState(false)
  const { initialized: tangramsInitialized } = useContext(TangramsContext)
  const { playlist, initialized: galleryInitialized } = useContext(
    GalleryContext
  )
  const { currentUser, initialized: usersInitialized } = useContext(UserContext)

  const isEverythingInitialized =
    usersInitialized && tangramsInitialized && galleryInitialized && playlist

  useEffect(() => {
    setTimeout(() => setWaited(true), FADE_TRANSITION_DURATION * 2)

    setShowLoaderTimeout(
      setTimeout(() => setShowLoader(true), FADE_TRANSITION_DURATION * 2)
    )
  }, [])

  useEffect(() => {
    if (isEverythingInitialized) {
      clearTimeout(showLoaderTimeout)
      setShowLoader(false)
    }
  }, [isEverythingInitialized])

  if (initialized) {
    return (
      <>
        <Tangram></Tangram>
        <Menu></Menu>
      </>
    )
  }

  const handleAnimationEnd = () => {
    setInitialized(true)
    if (currentUser) {
      notify(
        intl.formatMessage(
          { id: "Logged in as {username}" },
          {
            username: currentUser.username,
          }
        )
      )
    }
  }

  return (
    <View
      css={{
        flex: "1",
        alignItems: "center",
        justifyContent: "center",
        gap: "3",
        animation:
          isEverythingInitialized && waited
            ? "{durations.fade} fadeIn ease {durations.stagger} forwards reverse"
            : undefined,
      }}
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) {
          handleAnimationEnd()
        }
      }}
    >
      <View
        css={{
          animation: "{durations.fade} fadeIn ease {durations.stagger} both",
        }}
      >
        <Logo
          css={{
            boxSize: "logo",
            overflow: "visible",
            "& > g": {
              transition: "all {durations.fade} ease",
              transform:
                isEverythingInitialized && waited
                  ? "translate(30px, -30px)"
                  : "translate(0, 0)",
            },
          }}
        />
      </View>

      <Title
        css={{
          transition: "opacity {durations.fade} ease",
          opacity: showLoader ? 1 : 0,
        }}
      >
        {intl.formatMessage({ id: "Loading..." })}
      </Title>
    </View>
  )
}
