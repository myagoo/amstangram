import React, { useContext } from "react"
import { FiAward, FiGrid, FiSave, FiSettings, FiUser } from "react-icons/fi"
import { useIntl } from "react-intl"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { SoundContext } from "../contexts/sound"
import { UserContext } from "../contexts/user"
import { Badge } from "./badge"
import { Dialog } from "./dialog"
import { Logo } from "./logo"
import { Link, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"

const MenuItem = ({
  action,
  icon,
  text,
}: {
  action(): void
  icon: React.ElementType
  text: string
}) => {
  const { playButton } = useContext(SoundContext)
  return (
    <View
      css={{
        alignItems: "center",
        flexDirection: "row",
        gap: "3",
        cursor: "pointer",
        py: "3",
      }}
      onClick={() => {
        playButton()
        action()
      }}
    >
      <View as={icon} css={{ boxSize: "icon" }}></View>
      <Text css={{ fontSize: "3" }}>{text}</Text>
    </View>
  )
}

export const MenuDialog = ({ onClose }: { onClose(): void }) => {
  const { currentUser } = useContext(UserContext)
  const intl = useIntl()

  const { showLeaderboard, showGallery, showLogin, showProfile, showSettings } =
    useContext(DialogContext)

  const { requestSave } = useContext(GalleryContext)

  return (
    <Dialog
      onClose={onClose}
      title={
        <View css={{ flexDirection: "row", gap: "3", alignItems: "center" }}>
          <Logo
            css={{
              boxSize: "badge",
              ml: "-2px",
              mr: "-6px",
              overflow: "visible",
              "& > g": {
                animation:
                  "flight {durations.fade} {durations.stagger} ease both",
              },
            }}
          />
          <Title>{intl.formatMessage({ id: "Amstangram" })}</Title>
        </View>
      }
      css={{ gap: "3", overflow: "initial" }}
    >
      <View>
        {currentUser ? (
          <MenuItem
            action={() => showProfile(currentUser.uid)}
            icon={() => (
              <Badge css={{ mx: "-1" }} uid={currentUser.uid} size="badge" />
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
          action={() => {
            requestSave()
            onClose()
          }}
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
        <Link
          css={{ fontSize: "2", opacity: 0.75 }}
          href={`mailto:millagou.benjamin@gmail.com?subject=${intl.formatMessage(
            { id: "A word about Amstangram" }
          )}`}
          target="_blank"
          rel="noopener, noreferrer"
        >
          {intl.formatMessage({ id: "Contact 💌" })}
        </Link>
        <Link
          css={{ fontSize: "2", opacity: 0.75 }}
          href="https://github.com/myagoo/amstangram"
          target="_blank"
          rel="noopener, noreferrer"
        >
          {intl.formatMessage({ id: "Version {code}" }, { code: "🥟.🐼.🙈" })}
        </Link>
      </View>
    </Dialog>
  )
}
