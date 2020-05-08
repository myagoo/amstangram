import { extendPrimitive, ThemeContext } from "css-system"
import React, { useContext, useState, useCallback, useMemo } from "react"
import { FiShare2 } from "react-icons/fi"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { TangramsContext } from "../contexts/tangrams"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { SubTitle, Title } from "./primitives"
import { View } from "./view"
import { UserContext } from "../contexts/user"
import { Input } from "./input"
import {
  sortLettersTangrams,
  sortTangrams,
  sortDigitsTangrams,
} from "../utils/sortTangrams"

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

    return ["all", "uncompleted", "starred"].includes(
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

  const approvedTangramsByCategory = useMemo(() => {
    const newApprovedTangramsByCategory = {}

    for (const tangram of approvedTangrams) {
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

      if (!newApprovedTangramsByCategory[tangram.category]) {
        newApprovedTangramsByCategory[tangram.category] = []
      }

      newApprovedTangramsByCategory[tangram.category].push(tangram)
    }

    const newSortedApprovedTangramsByCategory = {}

    for (const sortedCategory of Object.keys(
      newApprovedTangramsByCategory
    ).sort()) {
      newSortedApprovedTangramsByCategory[
        sortedCategory
      ] = newApprovedTangramsByCategory[sortedCategory].sort(
        sortedCategory === "letters"
          ? sortLettersTangrams
          : sortedCategory === "digits"
          ? sortDigitsTangrams
          : sortTangrams
      )
    }

    return newSortedApprovedTangramsByCategory
  }, [
    approvedTangrams,
    selectedGalleryFilter,
    isTangramCompleted,
    isTangramStarred,
  ])

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
            </Input>

            <View css={{ flex: "1", overflow: "auto", gap: 3 }}>
              {pendingTangrams.length > 0 && (
                <View>
                  <FadedView>
                    <SubTitle>
                      {intl.formatMessage({ id: "Pending approbation" })}
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
                    {pendingTangrams.map((tangram) => (
                      <Card
                        showStroke={currentUser && currentUser.isAdmin}
                        key={tangram.id}
                        tangram={tangram}
                        completed={isTangramCompleted(tangram.id)}
                        selected={selectedTangrams.some(
                          (pendingSelectedTangram) =>
                            pendingSelectedTangram.id === tangram.id
                        )}
                        onClick={handleTangramClick}
                        onBadgeClick={showProfile}
                        onLongPress={showTangram}
                      />
                    ))}
                  </View>
                </View>
              )}

              {Object.keys(approvedTangramsByCategory).map((category) => (
                <View key={category}>
                  <FadedView>
                    <SubTitle>{intl.formatMessage({ id: category })}</SubTitle>
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
                    {approvedTangramsByCategory[category].map((tangram) => (
                      <Card
                        key={tangram.id}
                        tangram={tangram}
                        completed={isTangramCompleted(tangram.id)}
                        selected={selectedTangrams.some(
                          (pendingSelectedTangram) =>
                            pendingSelectedTangram.id === tangram.id
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
