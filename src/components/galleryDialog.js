import { extendPrimitive, ThemeContext } from "css-system"
import React, { useCallback, useContext, useMemo, useState } from "react"
import { FiShare2, FiStar } from "react-icons/fi"
import { FormattedMessage, useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import {
  sortDigitsTangrams,
  sortLettersTangrams,
  sortTangrams,
} from "../utils/sortTangrams"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Hint, InlineIcon, SubTitle, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"

const FadedView = extendPrimitive(View, ({ css, ...props }) => {
  const theme = useContext(ThemeContext)
  return {
    css: {
      p: 3,
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 1,
      background: `linear-gradient(0deg, rgba(0,0,0,0) 0%, ${theme.colors.dialogBackground} 50%)`,
      ...css,
    },
    ...props,
  }
})

export const GalleryDialog = ({ deferred }) => {
  const intl = useIntl()

  const { currentUser } = useContext(UserContext)

  const { pendingTangrams, approvedTangrams } = useContext(TangramsContext)
  const { showProfile, showTangram } = useContext(DialogContext)
  const {
    setPlaylist,
    shareTangrams,
    startRandomPlaylist,
    isTangramCompleted,
    isTangramStarred,
  } = useContext(GalleryContext)

  const [selectedTangrams, setSelectedTangrams] = useState([])

  const [selectedGalleryFilter, setSelectedGalleryFilter] = useState(() => {
    const storedSelectedGalleryFilter = window.localStorage.getItem(
      "selectedGalleryFilter"
    )

    return ["all", "uncompleted", "starred", "pending"].includes(
      storedSelectedGalleryFilter
    )
      ? storedSelectedGalleryFilter
      : "all"
  })

  const handleGalleryFilterChange = (e) => {
    setSelectedGalleryFilter(e.target.value)
    window.localStorage.setItem("selectedGalleryFilter", e.target.value)
  }

  const handleTangramClick = useCallback((clickedTangram) => {
    console.log(clickedTangram)
    setSelectedTangrams((prevPendingSelectedTangrams) => {
      if (
        prevPendingSelectedTangrams.some(
          (pendingSelectedTangram) =>
            pendingSelectedTangram.id === clickedTangram.id
        )
      ) {
        return prevPendingSelectedTangrams.filter(
          (tangram) => tangram.id !== clickedTangram.id
        )
      }
      return [...prevPendingSelectedTangrams, clickedTangram]
    })
  }, [])

  const handleStartClick = () => {
    if (selectedTangrams.length) {
      setPlaylist(selectedTangrams)
    } else {
      startRandomPlaylist()
    }

    deferred.resolve()
  }

  const handleCloseClick = () => deferred.reject(DIALOG_CLOSED_REASON)

  const tangramsByCategory = useMemo(() => {
    const tangrams =
      selectedGalleryFilter === "pending" ? pendingTangrams : approvedTangrams

    const newTangramsByCategory = {}

    for (const tangram of tangrams) {
      if (
        selectedGalleryFilter === "uncompleted" &&
        isTangramCompleted(tangram.id)
      ) {
        continue
      }
      if (
        selectedGalleryFilter === "starred" &&
        !isTangramStarred(tangram.id)
      ) {
        continue
      }

      if (!newTangramsByCategory[tangram.category]) {
        newTangramsByCategory[tangram.category] = []
      }

      newTangramsByCategory[tangram.category].push(tangram)
    }

    const newSortedTangramsByCategory = {}

    for (const sortedCategory of Object.keys(newTangramsByCategory).sort()) {
      newSortedTangramsByCategory[sortedCategory] = newTangramsByCategory[
        sortedCategory
      ].sort(
        sortedCategory === "letters"
          ? sortLettersTangrams
          : sortedCategory === "digits"
          ? sortDigitsTangrams
          : sortTangrams
      )
    }

    return newSortedTangramsByCategory
  }, [
    pendingTangrams,
    approvedTangrams,
    selectedGalleryFilter,
    isTangramCompleted,
    isTangramStarred,
  ])

  const visibleCategories = Object.keys(tangramsByCategory)

  return (
    <>
      <Dialog
        title={<Title>{intl.formatMessage({ id: "Tangram gallery" })}</Title>}
        css={{
          gap: 3,
          width: "568px",
        }}
        onClose={handleCloseClick}
      >
        {
          <>
            <Input
              as="select"
              value={selectedGalleryFilter}
              onChange={handleGalleryFilterChange}
            >
              <option value="all">
                {intl.formatMessage({ id: "All tangrams" })}
              </option>
              <option value="uncompleted">
                {intl.formatMessage({ id: "Uncompleted tangrams" })}
              </option>
              <option value="starred">
                {intl.formatMessage({ id: "★ Starred tangrams" })}
              </option>
              <option value="pending">
                {intl.formatMessage({ id: "Pending approbation tangrams" })}
              </option>
            </Input>
            <View css={{ flex: "1", overflow: "auto", gap: 3 }}>
              {visibleCategories.length === 0 ? (
                <View
                  key="noresult"
                  css={{
                    gap: 3,
                    alignItems: "center",
                  }}
                >
                  {selectedGalleryFilter === "uncompleted" ? (
                    <>
                      <Text css={{ fontSize: "8em" }}>{"🍾"}</Text>
                      <View css={{ gap: 2, alignItems: "center", px: 3 }}>
                        <SubTitle css={{ textAlign: "center" }}>
                          <FormattedMessage id="You've completed all tangrams" />
                        </SubTitle>
                        <Hint>
                          <FormattedMessage id="Come back later for more or create your own tangrams" />
                        </Hint>
                      </View>
                    </>
                  ) : selectedGalleryFilter === "pending" ? (
                    currentUser && currentUser.isAdmin ? (
                      <>
                        <Text css={{ fontSize: "8em" }}>{"👮"}</Text>
                        <View css={{ gap: 2, alignItems: "center", px: 3 }}>
                          <SubTitle css={{ textAlign: "center" }}>
                            <FormattedMessage id="No tangram left to approve" />
                          </SubTitle>
                          <Hint>
                            <FormattedMessage
                              id="Good job moderator {username}!"
                              values={{ username: currentUser.username }}
                            />
                          </Hint>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text css={{ fontSize: "8em" }}>{"👍"}</Text>
                        <View css={{ gap: 2, alignItems: "center", px: 3 }}>
                          <SubTitle css={{ textAlign: "center" }}>
                            <FormattedMessage id="All your tangrams have been approved" />
                          </SubTitle>
                          <Hint>
                            <FormattedMessage
                              id="Create more tangrams and earn <starIcon></starIcon>"
                              values={{
                                starIcon: () => (
                                  <InlineIcon
                                    icon={FiStar}
                                    css={{ fill: "currentColor" }}
                                  ></InlineIcon>
                                ),
                              }}
                            />
                          </Hint>
                        </View>
                      </>
                    )
                  ) : selectedGalleryFilter === "starred" ? (
                    <>
                      <Text css={{ fontSize: "8em" }}>{"🌃"}</Text>
                      <View css={{ gap: 2, alignItems: "center", px: 3 }}>
                        <SubTitle css={{ textAlign: "center" }}>
                          <FormattedMessage id="No starred tangrams yet" />
                        </SubTitle>
                        <Hint>
                          <FormattedMessage
                            id="Press <starIcon></starIcon> to star a tangram and show your love"
                            values={{
                              starIcon: () => (
                                <InlineIcon
                                  icon={FiStar}
                                  css={{ fill: "currentColor" }}
                                ></InlineIcon>
                              ),
                            }}
                          />
                        </Hint>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text css={{ fontSize: "8em" }}>{"🤷"}</Text>
                      <View css={{ gap: 2, alignItems: "center", px: 3 }}>
                        <SubTitle css={{ textAlign: "center" }}>
                          <FormattedMessage id="Nothing to see here" />
                        </SubTitle>
                        <Hint>
                          <FormattedMessage id="Something might have gone wrong" />
                        </Hint>
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View
                  key="results"
                  css={{ flex: "1", overflow: "auto", gap: 3 }}
                >
                  {visibleCategories.map((category) => (
                    <View key={category}>
                      <FadedView>
                        <SubTitle>
                          {intl.formatMessage({ id: category })}
                        </SubTitle>
                      </FadedView>
                      <View
                        css={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, 136px)",
                          gridColumnGap: 2,
                          gridRowGap: 2,
                          justifyContent: "center",
                          justifyItems: "center",
                          alignItems: "center",
                        }}
                      >
                        {tangramsByCategory[category].map((tangram) => (
                          <Card
                            showStroke={
                              selectedGalleryFilter === "pending" &&
                              currentUser &&
                              currentUser.isAdmin
                            }
                            key={tangram.id}
                            tangram={tangram}
                            completed={isTangramCompleted(tangram.id)}
                            selected={selectedTangrams.some(
                              (selectedTangram) =>
                                selectedTangram.id === tangram.id
                            )}
                            onClick={handleTangramClick}
                            onBadgeClick={showProfile}
                            onLongPress={showTangram}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View css={{ flexDirection: "row", gap: 2 }}>
              <PrimaryButton onClick={handleStartClick} css={{ flex: "1" }}>
                {selectedTangrams.length === 0
                  ? intl.formatMessage({ id: "Play now!" })
                  : selectedTangrams.length === 1
                  ? intl.formatMessage({ id: "Start 1 tangram!" })
                  : intl.formatMessage(
                      { id: "Start {count} tangrams!" },
                      { count: selectedTangrams.length }
                    )}
              </PrimaryButton>
              <PrimaryButton
                disabled={selectedTangrams.length === 0}
                onClick={() => shareTangrams(selectedTangrams)}
              >
                <View as={FiShare2} css={{ size: "icon", m: "-2px" }}></View>
              </PrimaryButton>
            </View>
          </>
        }
      </Dialog>
    </>
  )
}
