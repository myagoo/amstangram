import React, { useContext, useState } from "react"
import { FiGrid, FiPlay, FiSave, FiShuffle, FiX } from "react-icons/fi"
import {
  DEV,
  COLOR_TRANSITION_DURATION,
  FADEIN_TRANSITION_DURATION,
  FADEIN_STAGGER_DURATION,
} from "../constants"
import { TangramsContext } from "../contexts/tangrams"
import { shuffle } from "../utils/shuffle"
import { Button } from "./button"
import { Card } from "./card"
import { View } from "./view"

export const Gallery = () => {
  const {
    tangramsByGroup,
    completedTangramsEmoji,
    requestSave,
    setSelectedTangrams,
  } = useContext(TangramsContext)

  const [pendingSelectedTangrams, setPendingSelectedTangrams] = useState([])
  const [galleryOpened, setGalleryOpened] = useState(false)

  const handleTangramClick = clickedTangram => {
    setPendingSelectedTangrams(prevPendingSelectedTangrams => {
      if (
        prevPendingSelectedTangrams.some(
          pendingSelectedTangram =>
            pendingSelectedTangram.id === clickedTangram.id
        )
      ) {
        return pendingSelectedTangrams.filter(
          tangram => tangram.id !== clickedTangram.id
        )
      }
      return [...pendingSelectedTangrams, clickedTangram]
    })
  }

  const handleGalleryToggle = () => {
    setGalleryOpened(!galleryOpened)
    setPendingSelectedTangrams([])
  }

  const handleStartPlaylist = () => {
    if (pendingSelectedTangrams.length) {
      setSelectedTangrams(pendingSelectedTangrams)
    } else {
      setSelectedTangrams(shuffle(Object.values(tangramsByGroup).flat()))
    }
    setPendingSelectedTangrams([])
    setGalleryOpened(false)
  }

  const handleCategoryClick = category => {
    if (
      pendingSelectedTangrams.length &&
      pendingSelectedTangrams.every(pendingSelectedTangram =>
        tangramsByGroup[category].includes(pendingSelectedTangram)
      )
    ) {
      setPendingSelectedTangrams([])
    } else {
      setPendingSelectedTangrams(shuffle([...tangramsByGroup[category]]))
    }
  }

  return (
    <>
      <View
        css={{
          position: "fixed",
          left: "0",
          transform: `translate3d(${galleryOpened ? 0 : "-100vw"}, 0, 0)`,
          width: "100vw",
          height: "100%",
          overflow: "auto",
          p: 3,
          gap: 4,
          color: "galleryText",
          bg: "galleryBackground",
          transition: `background-color ${COLOR_TRANSITION_DURATION}ms, color ${COLOR_TRANSITION_DURATION}ms, transform 250ms ease`,
        }}
        deps={[galleryOpened]}
      >
        {Object.keys(tangramsByGroup).map(category => (
          <View key={category} css={{ gap: 3 }}>
            <View
              css={{
                fontSize: 5,
                textTransform: "uppercase",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
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
              {tangramsByGroup[category].map(tangram => (
                <Card
                  key={tangram.id}
                  tangram={tangram}
                  completedEmoji={completedTangramsEmoji[tangram.id]}
                  selected={pendingSelectedTangrams.some(
                    pendingSelectedTangram =>
                      pendingSelectedTangram.id === tangram.id
                  )}
                  onClick={() => handleTangramClick(tangram)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
      <View
        css={{
          gap: 3,
          position: "fixed",
          right: 3,
          bottom: 3,
          zIndex: 1,
          animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${FADEIN_STAGGER_DURATION *
            2}ms ease both`,
        }}
      >
        {DEV && (
          <Button onClick={requestSave}>
            <View as={FiSave} css={{ m: "auto" }} />
          </Button>
        )}
        {galleryOpened && (
          <Button onClick={handleStartPlaylist}>
            <View
              as={pendingSelectedTangrams.length ? FiPlay : FiShuffle}
              css={{ m: "auto" }}
            />
          </Button>
        )}
        <Button onClick={handleGalleryToggle}>
          <View as={galleryOpened ? FiX : FiGrid} css={{ m: "auto" }} />
        </Button>
      </View>
    </>
  )
}
