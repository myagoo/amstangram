import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  FiAward,
  FiGrid,
  FiMenu,
  FiSave,
  FiSettings,
  FiShare2,
  FiUser,
  FiStar,
} from "react-icons/fi"
import { FormattedMessage, useIntl } from "react-intl"
import { PrimaryButton } from "../components/button"
import { Dialog } from "../components/dialog"
import { InlineIcon, Title } from "../components/primitives"
import { Text } from "../components/text"
import { View } from "../components/view"
import { DIALOG_CLOSED_REASON } from "../constants"
import { Deferred } from "../utils/deferred"
import { NotifyContext } from "./notify"
import { useShowBackgroundPattern } from "./showBackgroundPattern"
import { SoundContext } from "./sound"
import { TangramsContext } from "./tangrams"
import { UserContext } from "./user"
import { GalleryContext } from "./gallery"

export const TipsContext = createContext()

const TipDialog = ({
  deferred,
  tip: {
    id,
    title = (
      <Title>
        <FormattedMessage id="Random tip" />
      </Title>
    ),
    content,
  },
}) => {
  const intl = useIntl()
  const [hideTips, setHideTips] = useState(false)
  return (
    <Dialog
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      title={title}
      css={{ gap: 3, maxWidth: "300px" }}
    >
      {content}
      <PrimaryButton onClick={() => deferred.resolve(hideTips)}>
        {intl.formatMessage({ id: "Got it!" })}
      </PrimaryButton>
      {id !== "welcome" && (
        <View
          as="label"
          css={{
            gap: 1,
            flexDirection: "row",
            cursor: "pointer",
            alignItems: "flex-end",
          }}
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
      )}
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
  starIcon: <InlineIcon icon={FiStar} />,
  br: () => <br />,
}

const tips = [
  {
    id: "menu",
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.menu" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "gallery",
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.gallery" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "difficulty",
    predicate: ({ showBackgroundPattern }) => {
      return showBackgroundPattern
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.difficulty" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "theme",
    predicate: ({ themeKey }) => {
      return themeKey !== "dark"
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.theme" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "sound",
    predicate: ({ soundEnabled }) => {
      return soundEnabled
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.sound" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "account1",
    predicate: ({ currentUser }) => {
      return !currentUser
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.account1" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "account2",
    predicate: ({ currentUser }) => {
      return !currentUser
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.account2" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "stars",
    predicate: ({ currentUser }) => {
      return currentUser
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.stars" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "create",
    predicate: ({ currentUser, approvedTangrams, isTangramCompleted }) => {
      if (currentUser) {
        let completedTangrams = 0
        for (const { id } of approvedTangrams) {
          if (isTangramCompleted(id)) {
            completedTangrams += 1
            if (completedTangrams === 10) {
              return true
            }
          }
        }
      }
      return false
    },
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.create" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "share",
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.share" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "card",
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.card" values={iconValues} />
      </Text>
    ),
  },
  {
    id: "leaderboard",
    content: (
      <Text css={{ textAlign: "justify" }}>
        <FormattedMessage id="tips.leaderboard" values={iconValues} />
      </Text>
    ),
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
  const { approvedTangrams } = useContext(TangramsContext)
  const { isTangramCompleted } = useContext(GalleryContext)

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

  const showTip = useCallback((tip) => {
    const seenTipsId = getSeenTips()

    const deferred = new Deferred()

    setTipDialogData({ deferred, tip })

    return deferred.promise
      .then((hideTips) => {
        if (hideTips) {
          setTipsEnabled(false)
        }
      })
      .finally(() => {
        localStorage.setItem(
          "seenTips",
          JSON.stringify([...seenTipsId, tip.id])
        )
        setTipDialogData(null)
      })
  }, [])

  const showWelcome = useCallback(() => {
    if (!tipsEnabled) {
      return
    }

    const seenTipsId = getSeenTips()

    if (seenTipsId.includes("welcome")) {
      return
    }

    if (
      !currentUser ||
      !approvedTangrams.some((tangram) => isTangramCompleted(tangram.id))
    ) {
      showTip({
        id: "welcome",
        title: (
          <Title>
            <FormattedMessage id="Welcome to Amstangram" values={iconValues} />
          </Title>
        ),
        content: (
          <Text css={{ textAlign: "justify" }}>
            <FormattedMessage id="tips.welcome" values={iconValues} />
          </Text>
        ),
      })
    }
  }, [showTip, tipsEnabled, currentUser, approvedTangrams, isTangramCompleted])

  const showRandomTip = useCallback(() => {
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
          approvedTangrams,
          isTangramCompleted,
          soundEnabled,
        })
    )

    if (!unseenTips.length) {
      return
    }

    const tip = unseenTips[0]

    showTip(tip)
  }, [
    showTip,
    approvedTangrams,
    isTangramCompleted,
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
    notify(intl.formatMessage({ id: "Tips reseted successfuly" }))
  }, [notify, intl])

  const contextValue = useMemo(
    () => ({
      showRandomTip,
      showWelcome,
      tipsEnabled,
      toggleTips,
      resetTips,
    }),
    [showRandomTip, showWelcome, tipsEnabled, toggleTips, resetTips]
  )

  return (
    <TipsContext.Provider value={contextValue}>
      {children}
      {tipDialogData && <TipDialog {...tipDialogData}></TipDialog>}
    </TipsContext.Provider>
  )
}
