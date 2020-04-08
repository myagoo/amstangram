import React, { useContext, useState } from "react"
import { GalleryContext } from "../contexts/gallery"
import { UserContext } from "../contexts/user"
import { shuffle } from "../utils/shuffle"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { SubTitle, Title } from "./primitives"
import { View } from "./view"
import { extendPrimitive } from "../utils/createPrimitive"
import { useTranslate } from "../contexts/language"
import { FiShuffle } from "react-icons/fi"

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
  const { usersMetadata } = useContext(UserContext)
  const {
    setGalleryOpened,
    baseTangramsByGroup,
    communityTangramsByUser,
    pendingTangrams,
    completedTangramsEmoji,
    setPlaylist,
  } = useContext(GalleryContext)

  const [selectedTangrams, setSelectedTangrams] = useState([])

  const handleTangramClick = (clickedTangram) => {
    console.log(clickedTangram.id)
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
    setPlaylist(selectedTangrams)
    setGalleryOpened(null)
  }

  const handleShuffleClick = () => {
    if (selectedTangrams.length) {
      setPlaylist(shuffle(selectedTangrams))
    } else {
      setPlaylist(
        shuffle(
          Object.values(communityTangramsByUser)
            .flat()
            .concat(Object.values(baseTangramsByGroup).flat())
        )
      )
    }
    setGalleryOpened(null)
  }

  const handleCloseClick = () => setGalleryOpened(false)

  return (
    <>
      <Dialog
        title={<Title>{t("Tangram gallery")}</Title>}
        css={{
          gap: 3,
          width: "600px",
          maxWidth: "80vw",
        }}
        onClose={handleCloseClick}
      >
        <View
          css={{
            flex: "1",
            overflow: "auto",
            gap: 4,
          }}
        >
          {pendingTangrams.length !== 0 && (
            <View css={{ gap: 3 }}>
              <FadedView onClick={() => handleCategoryClick(pendingTangrams)}>
                <SubTitle>{t("Pending approbation")}</SubTitle>
              </FadedView>
              <View
                css={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, 128px)",
                  gridColumnGap: 3,
                  gridRowGap: 3,
                  justifyContent: "center",
                  justifyItems: "center",
                  alignItems: "center",
                }}
              >
                {pendingTangrams.map((pendingTangram) => (
                  <Card
                    key={pendingTangram.id}
                    tangram={pendingTangram}
                    completedEmoji={pendingTangram.emoji}
                    selected={selectedTangrams.some(
                      (selectedPendingTangram) =>
                        selectedPendingTangram.id === pendingTangram.id
                    )}
                    onClick={() => handleTangramClick(pendingTangram)}
                  />
                ))}
              </View>
            </View>
          )}
          {communityTangramsByUser === null || usersMetadata === null ? (
            <SubTitle>{t("Loading community tangrams")}</SubTitle>
          ) : (
            Object.keys(communityTangramsByUser).map((userId) => (
              <View key={userId} css={{ gap: 3 }}>
                <FadedView
                  onClick={() =>
                    handleCategoryClick(communityTangramsByUser[userId])
                  }
                >
                  <SubTitle>
                    {t("{username}'s tangrams", {
                      username: usersMetadata[userId].username,
                    })}
                  </SubTitle>
                </FadedView>
                <View
                  css={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, 128px)",
                    gridColumnGap: 3,
                    gridRowGap: 3,
                    justifyContent: "center",
                    justifyItems: "center",
                    alignItems: "center",
                  }}
                >
                  {communityTangramsByUser[userId].map((communityTangram) => (
                    <Card
                      key={communityTangram.id}
                      tangram={communityTangram}
                      completedEmoji={
                        completedTangramsEmoji[communityTangram.id]
                      }
                      selected={selectedTangrams.some(
                        (selectedCommunityTangram) =>
                          selectedCommunityTangram.id === communityTangram.id
                      )}
                      onClick={() => handleTangramClick(communityTangram)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
          {baseTangramsByGroup === null ? (
            <SubTitle>{t("Loading base tangrams")}</SubTitle>
          ) : (
            Object.keys(baseTangramsByGroup).map((category) => (
              <View key={category} css={{ gap: 3 }}>
                <FadedView
                  onClick={() =>
                    handleCategoryClick(baseTangramsByGroup[category])
                  }
                >
                  <SubTitle>{t(category)}</SubTitle>
                </FadedView>
                <View
                  css={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, 128px)",
                    gridColumnGap: 3,
                    gridRowGap: 3,
                    justifyContent: "center",
                    justifyItems: "center",
                    alignItems: "center",
                  }}
                >
                  {baseTangramsByGroup[category].map((tangram) => (
                    <Card
                      key={tangram.id}
                      tangram={tangram}
                      completedEmoji={completedTangramsEmoji[tangram.id]}
                      selected={selectedTangrams.some(
                        (pendingSelectedTangram) =>
                          pendingSelectedTangram.id === tangram.id
                      )}
                      onClick={() => handleTangramClick(tangram)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
        <View css={{ flexDirection: "row", gap: 2 }}>
          <PrimaryButton
            disabled={selectedTangrams.length === 0}
            onClick={handleStartClick}
            css={{ flex: "1" }}
          >
            {selectedTangrams.length === 0
              ? t("Select tangrams")
              : selectedTangrams.length === 1
              ? t("Start 1 tangram !")
              : t("Start {count} tangrams !", {
                  count: selectedTangrams.length,
                })}
          </PrimaryButton>
          <PrimaryButton onClick={handleShuffleClick}>
            <View as={FiShuffle} size={20}></View>
          </PrimaryButton>
        </View>
      </Dialog>
    </>
  )
}
