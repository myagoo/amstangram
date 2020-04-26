import React, { useContext, useState, useEffect } from "react"
import { Logo } from "../components/logo"
import { View } from "../components/view"
import { FADE_STAGGER_DURATION, FADE_TRANSITION_DURATION } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { Loader } from "./loader"
import { Tangram } from "./tangram"
import { UserContext } from "../contexts/user"
import { NotifyContext } from "../contexts/notify"
import { TangramsContext } from "../contexts/tangrams"
import { useIntl } from "react-intl"

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
    }
  }, [isEverythingInitialized])

  if (initialized) {
    return <Tangram></Tangram>
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
            size: 128,
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

      <Loader
        css={
          showLoader
            ? {
                animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease`,
              }
            : { opacity: 0 }
        }
        deps={[showLoader]}
      ></Loader>
    </View>
  )
}
