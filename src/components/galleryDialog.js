import firebase from "gatsby-plugin-firebase"
import React, { useContext, useEffect, useState } from "react"
import { GalleryContext } from "../contexts/gallery"
import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { shuffle } from "../utils/shuffle"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { SubTitle, Title } from "./primitives"
import { View } from "./view"

export const GalleryDialog = () => {
  const { currentUser } = useContext(UserContext)
  const {
    selectedTangrams,
    setSelectedTangrams,
    setGalleryOpened,
  } = useContext(GalleryContext)

  const { tangramsByGroup, completedTangramsEmoji, setPlaylist } = useContext(
    TangramsContext
  )

  const [communityTangrams, setCommunityTangrams] = useState([])

  const handleTangramClick = (clickedTangram) => {
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

  const handleCloseClick = () => setGalleryOpened(false)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("communityTangrams")
      .where("approved", "==", true)
      .onSnapshot((querySnapshot) => {
        setCommunityTangrams(
          querySnapshot.docs.map((doc) => {
            const tangram = doc.data()
            return {
              id: doc.id,
              difficulty: getTangramDifficulty(tangram),
              ...tangram,
            }
          })
        )
      })

    return () => unsubscribe
  }, [])

  const [pendingTangrams, setPendingTangrams] = useState([])

  useEffect(() => {
    console.log(currentUser)
    if (!currentUser || !currentUser.isAdmin) {
      return
    }
    let ref = firebase
      .firestore()
      .collection("communityTangrams")
      .where("approved", "==", false)

    if (!currentUser.isAdmin) {
      ref = ref.where("uid", "==", currentUser.uid)
    }

    const unsubscribe = ref.onSnapshot((querySnapshot) => {
      setPendingTangrams(
        querySnapshot.docs.map((doc) => {
          const tangram = doc.data()
          return {
            id: doc.id,
            difficulty: getTangramDifficulty(tangram),
            ...tangram,
          }
        })
      )
    })

    return () => {
      setPendingTangrams([])
      unsubscribe()
    }
  }, [currentUser])

  return (
    <>
      <Dialog
        title={<Title>Tangram gallery</Title>}
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
              <View
                css={{
                  alignItems: "center",
                  cursor: "pointer",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bg: "galleryBackground",
                }}
                onClick={() => handleCategoryClick(pendingTangrams)}
              >
                <SubTitle>Pending approbation</SubTitle>
              </View>
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
          {communityTangrams.length !== 0 && (
            <View css={{ gap: 3 }}>
              <View
                css={{
                  alignItems: "center",
                  cursor: "pointer",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bg: "galleryBackground",
                }}
                onClick={() => handleCategoryClick(communityTangrams)}
              >
                <SubTitle>Community</SubTitle>
              </View>
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
                {communityTangrams.map((communityTangram) => (
                  <Card
                    key={communityTangram.id}
                    tangram={communityTangram}
                    completedEmoji={communityTangram.emoji}
                    selected={selectedTangrams.some(
                      (selectedCommunityTangram) =>
                        selectedCommunityTangram.id === communityTangram.id
                    )}
                    onClick={() => handleTangramClick(communityTangram)}
                  />
                ))}
              </View>
            </View>
          )}
          {Object.keys(tangramsByGroup).map((category) => (
            <View key={category} css={{ gap: 3 }}>
              <View
                css={{
                  alignItems: "center",
                  cursor: "pointer",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  bg: "galleryBackground",
                }}
                onClick={() => handleCategoryClick(tangramsByGroup[category])}
              >
                <SubTitle>{category}</SubTitle>
              </View>
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
                {tangramsByGroup[category].map((tangram) => (
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
          ))}
        </View>

        <PrimaryButton
          disabled={selectedTangrams.length === 0}
          onClick={handleStartClick}
        >
          {selectedTangrams.length === 0
            ? "Select tangrams to play"
            : `Start ${selectedTangrams.length} tangram${
                selectedTangrams.length > 1 ? "s" : ""
              } !`}
        </PrimaryButton>
      </Dialog>
    </>
  )
}
