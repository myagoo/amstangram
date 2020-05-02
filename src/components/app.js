import React, { useContext, useEffect, useState } from "react"
import { useIntl } from "react-intl"
import { Logo } from "../components/logo"
import { View } from "../components/view"
import { FADE_STAGGER_DURATION, FADE_TRANSITION_DURATION } from "../constants"
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
  const [showLoaderTimeout, setShowLoaderTimeout] = useState(false)
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
        gap: 3,
        animation:
          isEverythingInitialized && waited
            ? `${FADE_TRANSITION_DURATION}ms fadeIn ease ${FADE_STAGGER_DURATION}ms reverse`
            : undefined,
      }}
      deps={[isEverythingInitialized, waited]}
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) {
          handleAnimationEnd()
        }
      }}
    >
      <View
        css={{
          animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease ${FADE_STAGGER_DURATION}ms both`,
        }}
      >
        <Logo
          css={{
            size: "logo",
            overflow: "visible",
            "& > g": {
              transition: `all ${FADE_TRANSITION_DURATION}ms ease`,
              transform:
                isEverythingInitialized && waited
                  ? "translate(30px, -30px)"
                  : "translate(0, 0)",
            },
          }}
          deps={[isEverythingInitialized, waited]}
        />
      </View>

      <Title
        css={{
          transition: `opacity ${FADE_TRANSITION_DURATION}ms ease`,
          opacity: showLoader ? 1 : 0,
        }}
        deps={[showLoader]}
      >
        {intl.formatMessage({ id: "Loading..." })}
      </Title>
    </View>
  )
}
