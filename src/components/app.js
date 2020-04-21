import React, { useContext, useState, useEffect } from "react"
import { Logo } from "../components/logo"
import { View } from "../components/view"
import { FADE_STAGGER_DURATION, FADE_TRANSITION_DURATION } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { Loader } from "./loader"
import { Tangram } from "./tangram"
import { UserContext } from "../contexts/user"
import { useTranslate } from "../contexts/language"
import { NotifyContext } from "../contexts/notify"

export const App = () => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)
  const [waited, setWaited] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [showLoaderTimeout, setShowLoaderTimeout] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { playlist } = useContext(GalleryContext)
  const { currentUser } = useContext(UserContext)

  useEffect(() => {
    setTimeout(() => setWaited(true), FADE_TRANSITION_DURATION * 2)

    setShowLoaderTimeout(
      setTimeout(() => setShowLoader(true), FADE_TRANSITION_DURATION * 2)
    )
  }, [])

  useEffect(() => {
    if (playlist) {
      clearTimeout(showLoaderTimeout)
    }
  }, [playlist, showLoaderTimeout])

  if (initialized) {
    return <Tangram></Tangram>
  }

  const handleAnimationEnd = () => {
    setInitialized(true)
    if (currentUser) {
      notify(t("Logged in as {username}", { username: currentUser.username }))
    }
  }

  return (
    <View
      css={{
        flex: "1",
        alignItems: "center",
        justifyContent: "center",
        animation:
          playlist && waited
            ? `${FADE_TRANSITION_DURATION}ms fadeIn ease reverse`
            : undefined,
      }}
      deps={[playlist, waited]}
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target) {
          handleAnimationEnd()
        }
      }}
    >
      <View
        css={{
          px: 4,
          width: "100%",
          maxWidth: "600px",
          animation: `${FADE_TRANSITION_DURATION}ms fadeIn  ease ${FADE_STAGGER_DURATION}ms both`,
        }}
      >
        <View as={Logo} />
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
