import React, { useContext, useState } from "react"
import { FiShare2 } from "react-icons/fi"
import { GalleryContext } from "../contexts/gallery"
import { useTranslate } from "../contexts/language"
import { UserContext } from "../contexts/user"
import { extendPrimitive } from "../utils/createPrimitive"
import { shuffle } from "../utils/shuffle"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { SubTitle, Title } from "./primitives"
import { View } from "./view"
import { Loader } from "./loader"

const FadedView = extendPrimitive(View, (css, theme) => ({
  ...css,
  p: 1,
  alignItems: "center",
  cursor: "pointer",
  position: "sticky",
  top: 0,
  zIndex: 1,
  background: `linear-gradient(0deg, rgba(0,0,0,0) 0%, ${theme.colors.galleryBackground} 50%)`,
}))

export const GalleryDialog = () => {
  const t = useTranslate()
  const { usersMetadata, showProfile } = useContext(UserContext)
  const {
    setGalleryOpened,
    tangramsByCategory,
    setPlaylist,
    completedTangrams,
    getTangramRef,
    shareTangrams,
  } = useContext(GalleryContext)

  const [selectedTangrams, setSelectedTangrams] = useState([])

  const handleTangramClick = (clickedTangram) => {
    console.log(clickedTangram)
    setSelectedTangrams((prevPendingSelectedTangrams) => {
      if (
        prevPendingSelectedTangrams.some(
          (pendingSelectedTangram) =>
            pendingSelectedTangram.id === clickedTangram.id
        )
      ) {
        return selectedTangrams.filter(
          (tangram) => tangram.id !== clickedTangram.id
        )
      }
      return [...selectedTangrams, clickedTangram]
    })
  }

  const handleCategoryClick = (tangrams) => {
    if (
      selectedTangrams.length &&
      selectedTangrams.every((pendingSelectedTangram) =>
        tangrams.includes(pendingSelectedTangram)
      )
    ) {
      setSelectedTangrams([])
    } else {
      setSelectedTangrams(shuffle([...tangrams]))
    }
  }

  const handleStartClick = () => {
    setPlaylist(
      selectedTangrams.length
        ? selectedTangrams
        : shuffle(Object.values(tangramsByCategory).flat())
    )
    setGalleryOpened(null)
  }

  const handleCloseClick = () => setGalleryOpened(false)

  return (
    <>
      <Dialog
        title={<Title>{t("Tangram gallery")}</Title>}
        css={{
          gap: 3,
          width: "500px",
          maxWidth: "80vw",
        }}
        onClose={handleCloseClick}
      >
        {tangramsByCategory === null || usersMetadata === null ? (
          <>
            <Loader css={{ m: "auto" }}></Loader>
          </>
        ) : (
          <>
            <View css={{ flex: "1", overflow: "auto", gap: 4 }}>
              {Object.keys(tangramsByCategory).map((category) => (
                <View key={category} css={{ gap: 3 }}>
                  <FadedView
                    onClick={() =>
                      handleCategoryClick(tangramsByCategory[category])
                    }
                  >
                    <SubTitle>{t(category)}</SubTitle>
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
                        key={tangram.id}
                        tangram={tangram}
                        completed={completedTangrams[tangram.id]}
                        selected={selectedTangrams.some(
                          (pendingSelectedTangram) =>
                            pendingSelectedTangram.id === tangram.id
                        )}
                        onClick={() => handleTangramClick(tangram)}
                        onBadgeClick={showProfile}
                        onLongPress={getTangramRef.current}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View css={{ flexDirection: "row", gap: 2 }}>
              <PrimaryButton onClick={handleStartClick} css={{ flex: "1" }}>
                {selectedTangrams.length === 0
                  ? t("Play now !")
                  : selectedTangrams.length === 1
                  ? t("Start 1 tangram !")
                  : t("Start {count} tangrams !", {
                      count: selectedTangrams.length,
                    })}
              </PrimaryButton>
              <PrimaryButton
                disabled={selectedTangrams.length === 0}
                onClick={() => shareTangrams(selectedTangrams)}
              >
                <View as={FiShare2} size={20}></View>
              </PrimaryButton>
            </View>
          </>
        )}
      </Dialog>
    </>
  )
}
