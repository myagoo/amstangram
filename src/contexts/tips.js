import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react"
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
import { NotifyContext } from "./notify"

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
  const [hideTips, setHideTips] = useState(false)
  return (
    <Dialog
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      title={<Title>{intl.formatMessage({ id: "Random tip" })}</Title>}
      css={{ gap: 3, maxWidth: "300px" }}
    >
      <Content></Content>
      <PrimaryButton onClick={() => deferred.resolve(hideTips)}>
        {intl.formatMessage({ id: "Got it!" })}
      </PrimaryButton>
      <View
        as="label"
        css={{ gap: 1, flexDirection: "row", cursor: "pointer" }}
      >
        <input
          type="checkbox"
          checked={hideTips}
          onChange={() => setHideTips(!hideTips)}
        ></input>
        <Text as="small">
          {intl.formatMessage({ id: "I don't want to see tips anymore" })}
        </Text>
      </View>
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
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.menu" }, iconValues)}
        </Text>
      )
    },
  },
  {
    id: "gallery",
    Content: () => {
      const intl = useIntl()
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.gallery" }, iconValues)}
        </Text>
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
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.difficulty" }, iconValues)}
        </Text>
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
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.theme" }, iconValues)}
        </Text>
      )
    },
  },
  {
    id: "sound",
    predicate: ({ soundEnabled }) => {
      return soundEnabled
    },
    Content: () => {
      const intl = useIntl()
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.sound" }, iconValues)}
        </Text>
      )
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
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.account" }, iconValues)}
        </Text>
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
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.claps" }, iconValues)}
        </Text>
      )
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
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.create" }, iconValues)}
        </Text>
      )
    },
  },
  {
    id: "share",
    Content: () => {
      const intl = useIntl()
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.share" }, iconValues)}
        </Text>
      )
    },
  },
  {
    id: "card",
    Content: () => {
      const intl = useIntl()
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.card" }, iconValues)}
        </Text>
      )
    },
  },
  {
    id: "leaderboard",
    Content: () => {
      const intl = useIntl()
      return (
        <Text css={{ textAlign: "justify" }}>
          {intl.formatMessage({ id: "tips.leaderboard" }, iconValues)}
        </Text>
      )
    },
  },
]

export const TipsProvider = ({ children }) => {
  const intl = useIntl()
  const notify = useContext(NotifyContext)
  const [tipDialogData, setTipDialogData] = useState(null)
  const [tipsEnabled, setTipsEnabled] = useState(true)

  const { soundEnabled } = useContext(SoundContext)
  const [themeKey] = useSwitchTheme()
  const [showBackgroundPattern] = useShowBackgroundPattern()
  const { currentUser } = useContext(UserContext)
  const { completedTangrams } = useContext(GalleryContext)

  useEffect(() => {
    setTipsEnabled(window.localStorage.getItem("hideTips") === null)
  }, [])

  useEffect(() => {
    if (tipsEnabled) {
      window.localStorage.removeItem("hideTips")
    } else {
      window.localStorage.setItem("hideTips", true)
    }
  }, [tipsEnabled])

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
    if (!tipsEnabled) {
      return
    }

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

    return deferred.promise
      .then((hideTips) => {
        if (hideTips) {
          window.localStorage.setItem("hideTips", true)
        }
      })
      .finally(() => {
        localStorage.setItem(
          "seenTips",
          JSON.stringify([...seenTipsId, tip.id])
        )
        setTipDialogData(null)
      })
  }, [
    completedTangrams,
    themeKey,
    currentUser,
    showBackgroundPattern,
    soundEnabled,
    tipsEnabled,
  ])

  const toggleTips = useCallback(() => {
    setTipsEnabled((prevTipsEnabled) => !prevTipsEnabled)
  }, [])

  const resetTips = useCallback(() => {
    setTipsEnabled(true)
    window.localStorage.removeItem("seenTips")
    notify(intl.formatMessage({ id: "Tips reset successfuly" }))
  }, [notify, intl])

  const contextValue = useMemo(
    () => ({
      showTip,
      tipsEnabled,
      toggleTips,
      resetTips,
    }),
    [showTip, tipsEnabled, toggleTips, resetTips]
  )

  return (
    <TipsContext.Provider value={contextValue}>
      {children}
      {tipDialogData && <TipDialog {...tipDialogData}></TipDialog>}
    </TipsContext.Provider>
  )
}
