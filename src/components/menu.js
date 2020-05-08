import { useKeyframes } from "css-system"
import React, { useContext, useEffect, useState } from "react"
import {
  FiAward,
  FiGrid,
  FiMenu,
  FiSave,
  FiSettings,
  FiUser,
} from "react-icons/fi"
import { useIntl } from "react-intl"
import {
  DIALOG_CLOSED_REASON,
  FADE_STAGGER_DURATION,
  FADE_TRANSITION_DURATION,
} from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { SoundContext } from "../contexts/sound"
import { UserContext } from "../contexts/user"
import { Deferred } from "../utils/deferred"
import { Badge } from "./badge"
import { Dialog } from "./dialog"
import { Logo } from "./logo"
import { Hint, Link, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"

const MenuItem = ({ action, icon, text }) => {
  const { playButton } = useContext(SoundContext)
  return (
    <View
      css={{
        alignItems: "center",
        flexDirection: "row",
        gap: 3,
        cursor: "pointer",
        py: 3,
      }}
      onClick={() => {
        playButton()
        action()
      }}
    >
      <View as={icon} css={{ size: "icon" }}></View>
      <Text css={{ fontSize: 3 }}>{text}</Text>
    </View>
  )
}

export const Menu = () => {
  const { playlist, saveRequestId } = useContext(GalleryContext)
  const { currentUser } = useContext(UserContext)
  const { playButton } = useContext(SoundContext)
  const intl = useIntl()

  const {
    showLeaderboard,
    showGallery,
    showLogin,
    showProfile,
    showSettings,
  } = useContext(DialogContext)

  const [menuDialogDeferred, setMenuDialogDeferred] = useState()

  useEffect(() => {
    menuDialogDeferred && menuDialogDeferred.reject(DIALOG_CLOSED_REASON)
  }, [playlist, saveRequestId])

  const { requestSave } = useContext(GalleryContext)

  const handleMenuClick = () => {
    playButton()
    const deferred = new Deferred()
    setMenuDialogDeferred(deferred)
    return deferred.promise.finally(() => setMenuDialogDeferred(null))
  }

  const gradient = useKeyframes({
    0: { color: "pieces.lt2" },
    14: { color: "pieces.rh" },
    28: { color: "pieces.st2" },
    42: { color: "pieces.mt1" },
    57: { color: "pieces.st1" },
    71: { color: "pieces.lt1" },
    85: { color: "pieces.sq" },
    100: { color: "pieces.lt2" },
  })

  const flightAnimation = useKeyframes({
    from: { transform: "translate(0, 0)" },
    to: {
      transform: "translate(30px, -30px)",
    },
  })

  return (
    <>
      <View
        css={{
          position: "fixed",
          top: 3,
          left: 3,
          animation: `${gradient} 20s linear infinite both`,
        }}
      >
        <View
          as={FiMenu}
          css={{
            size: "menu",
            cursor: "pointer",
          }}
          onClick={handleMenuClick}
        ></View>
      </View>

      {menuDialogDeferred && (
        <Dialog
          onClose={() => menuDialogDeferred.reject(DIALOG_CLOSED_REASON)}
          title={
            <View css={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
              <Logo
                css={{
                  size: "badge",
                  ml: "-2px",
                  mr: "-6px",
                  overflow: "visible",
                  "& > g": {
                    animation: `${flightAnimation} ${FADE_TRANSITION_DURATION}ms ${FADE_STAGGER_DURATION}ms ease both`,
                  },
                }}
              />
              <Title>{intl.formatMessage({ id: "Amstangram" })}</Title>
            </View>
          }
          css={{ gap: 3, overflow: "initial" }}
        >
          <View>
            {currentUser ? (
              <MenuItem
                action={() => showProfile(currentUser.uid)}
                icon={() => (
                  <Badge css={{ mx: -1 }} uid={currentUser.uid} size="badge" />
                )}
                text={intl.formatMessage({ id: "See my profile" })}
              ></MenuItem>
            ) : (
              <MenuItem
                action={showLogin}
                icon={FiUser}
                text={intl.formatMessage({ id: "Log in" })}
              ></MenuItem>
            )}

            <MenuItem
              action={showGallery}
              icon={FiGrid}
              text={intl.formatMessage({ id: "Tangram gallery" })}
            ></MenuItem>

            <MenuItem
              action={requestSave}
              icon={FiSave}
              text={intl.formatMessage({ id: "Save tangram" })}
            ></MenuItem>

            <MenuItem
              action={showLeaderboard}
              icon={FiAward}
              text={intl.formatMessage({ id: "Leaderboard" })}
            ></MenuItem>

            <MenuItem
              action={showSettings}
              icon={FiSettings}
              text={intl.formatMessage({ id: "Settings" })}
            ></MenuItem>
          </View>

          <View
            css={{
              flexDirection: "row",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <Hint
              as={Link}
              href={`mailto:millagou.benjamin@gmail.com?subject=${intl.formatMessage(
                { id: "A word about Amstangram" }
              )}`}
              target="_blank"
              rel="noopener, noreferrer"
            >
              {intl.formatMessage({ id: "Contact 💌" })}
            </Hint>
            <Hint
              as={Link}
              href="https://github.com/myagoo/amstangram"
              target="_blank"
              rel="noopener, noreferrer"
            >
              {intl.formatMessage(
                { id: "Version {code}" },
                { code: "⭐.🍽.💣" }
              )}
            </Hint>
          </View>
        </Dialog>
      )}
    </>
  )
}
