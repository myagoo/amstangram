import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, { createContext, useCallback, useContext, useState } from "react"
import {
  FiGrid,
  FiMenu,
  FiSave,
  FiSettings,
  FiShare2,
  FiUser,
  FiAward,
} from "react-icons/fi"
import { useIntl } from "react-intl"
import { Button, PrimaryButton } from "../components/button"
import { Dialog } from "../components/dialog"
import { Title } from "../components/primitives"
import { Text } from "../components/text"
import { View } from "../components/view"
import { DIALOG_CLOSED_REASON } from "../constants"
import { Deferred } from "../utils/deferred"
import { GalleryContext } from "./gallery"
import { useShowBackgroundPattern } from "./showBackgroundPattern"
import { SoundContext } from "./sound"
import { UserContext } from "./user"

export const TipsContext = createContext()

const InlineIcon = ({ icon }) => {
  return (
    <Text css={{ position: "relative", top: "4px" }}>
      <Button
        css={{
          size: "20px",
          boxShadow: "none",
        }}
      >
        <View as={icon} css={{ m: "auto", size: "16px" }} />
      </Button>
    </Text>
  )
}

const TipDialog = ({ deferred, tip: { Content } }) => {
  const intl = useIntl()
  return (
    <Dialog
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      title={<Title>{intl.formatMessage({ id: "Random tip" })}</Title>}
      css={{ gap: 3, maxWidth: "300px" }}
    >
      <Content></Content>
      <PrimaryButton onClick={deferred.resolve}>
        {intl.formatMessage({ id: "Got it!" })}
      </PrimaryButton>
    </Dialog>
  )
}

const iconValues = {
  settingsIcon: <InlineIcon icon={FiSettings} />,
  accountIcon: <InlineIcon icon={FiUser} />,
  menuIcon: <InlineIcon icon={FiMenu} />,
  galleryIcon: <InlineIcon icon={FiGrid} />,
  shareIcon: <InlineIcon icon={FiShare2} />,
  createIcon: <InlineIcon icon={FiSave} />,
  leaderboardIcon: <InlineIcon icon={FiAward} />,
}

const tips = [
  {
    id: "menu",
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.menu" }, iconValues)}</Text>
    },
  },
  {
    id: "gallery",
    Content: () => {
      const intl = useIntl()
      return (
        <Text>{intl.formatMessage({ id: "tips.gallery" }, iconValues)}</Text>
      )
    },
  },
  {
    id: "difficulty",
    predicate: ({ showBackgroundPattern }) => {
      return showBackgroundPattern
    },
    Content: () => {
      const intl = useIntl()
      return (
        <Text>{intl.formatMessage({ id: "tips.difficulty" }, iconValues)}</Text>
      )
    },
  },
  {
    id: "theme",
    predicate: ({ themeKey }) => {
      return themeKey !== "dark"
    },
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.theme" }, iconValues)}</Text>
    },
  },
  {
    id: "sound",
    predicate: ({ soundEnabled }) => {
      return soundEnabled
    },
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.sound" }, iconValues)}</Text>
    },
  },
  {
    id: "account",
    predicate: ({ currentUser }) => {
      return !currentUser
    },
    Content: () => {
      const intl = useIntl()
      return (
        <Text>{intl.formatMessage({ id: "tips.account" }, iconValues)}</Text>
      )
    },
  },
  {
    id: "claps",
    predicate: ({ currentUser }) => {
      return currentUser
    },
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.claps" }, iconValues)}</Text>
    },
  },
  {
    id: "create",
    predicate: ({ currentUser, completedTangrams }) => {
      return (
        currentUser &&
        completedTangrams[currentUser.uid] &&
        Object.values(completedTangrams[currentUser.uid]).length >= 10
      )
    },
    Content: () => {
      const intl = useIntl()
      return (
        <Text>{intl.formatMessage({ id: "tips.create" }, iconValues)}</Text>
      )
    },
  },
  {
    id: "share",
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.share" }, iconValues)}</Text>
    },
  },
  {
    id: "card",
    Content: () => {
      const intl = useIntl()
      return <Text>{intl.formatMessage({ id: "tips.card" }, iconValues)}</Text>
    },
  },
  {
    id: "leaderboard",
    Content: () => {
      const intl = useIntl()
      return (
        <Text>
          {intl.formatMessage({ id: "tips.leaderboard" }, iconValues)}
        </Text>
      )
    },
  },
]

export const TipsProvider = ({ children }) => {
  const [tipDialogData, setTipDialogData] = useState(null)

  const { soundEnabled } = useContext(SoundContext)
  const [themeKey] = useSwitchTheme()
  const [showBackgroundPattern] = useShowBackgroundPattern()
  const { currentUser } = useContext(UserContext)
  const { completedTangrams } = useContext(GalleryContext)

  const getSeenTips = () => {
    let seenTipsIds = []
    const data = localStorage.getItem("seenTips")
    if (data) {
      try {
        const parsedData = JSON.parse(data)
        if (!Array.isArray(parsedData)) {
          throw new Error("Invalid data for seenTips : " + parsedData)
        }
        seenTipsIds = parsedData
      } catch (error) {
        localStorage.removeItem("seenTips")
      }
    }
    return seenTipsIds
  }

  const showTip = useCallback(() => {
    const seenTipsId = getSeenTips()

    const unseenTips = tips.filter(
      ({ id, predicate = () => true }) =>
        !seenTipsId.includes(id) &&
        predicate({
          themeKey,
          showBackgroundPattern,
          currentUser,
          completedTangrams,
          soundEnabled,
        })
    )

    if (!unseenTips.length) {
      return
    }

    const tip = unseenTips[0]

    const deferred = new Deferred()

    setTipDialogData({ deferred, tip })

    return deferred.promise.finally(() => {
      localStorage.setItem("seenTips", JSON.stringify([...seenTipsId, tip.id]))
      setTipDialogData(null)
    })
  }, [
    completedTangrams,
    themeKey,
    currentUser,
    showBackgroundPattern,
    soundEnabled,
  ])

  return (
    <TipsContext.Provider value={showTip}>
      {children}
      {tipDialogData && <TipDialog {...tipDialogData}></TipDialog>}
    </TipsContext.Provider>
  )
}
