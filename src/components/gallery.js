import React, { useContext, useState } from "react"
import { FiGrid, FiPlay, FiSave, FiShuffle, FiX } from "react-icons/fi"
import { DEV } from "../constants"
import { TangramsContext } from "../contexts/tangrams"
import { shuffle } from "../utils/shuffle"
import { Button } from "./button"
import { Card } from "./card"
import { View } from "./view"

export const Gallery = () => {
  const {
    tangrams,
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
      setSelectedTangrams(shuffle(tangrams.nodes))
    }
    setPendingSelectedTangrams([])
    setGalleryOpened(false)
  }

  return (
    <>
      <View
        className="gallery"
        css={{
          position: "fixed",
          left: "0",
          transform: `translate3d(${galleryOpened ? 0 : "-100vw"}, 0, 0)`,
          transition: "transform .3s ease",
          width: "100vw",
          height: "100%",
          overflow: "auto",
          p: 3,
          gap: 4,
        }}
        deps={[galleryOpened]}
      >
        {tangrams.group.map(({ fieldValue, nodes }) => (
          <View key={fieldValue} css={{ gap: 3 }}>
            <View
              css={{
                px: 4,
                fontSize: 5,
                textTransform: "uppercase",
              }}
            >
              {fieldValue}
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
              {nodes
                .map(({ percent, ...node }) => {
                  const difficulty = percent > 50 ? 0 : percent > 20 ? 1 : 2
                  return {
                    ...node,
                    difficulty,
                  }
                })
                .sort((tangramA, tangramB) => {
                  return tangramA.order && tangramB.order
                    ? tangramA.order - tangramB.order
                    : tangramA.difficulty - tangramB.difficulty
                })
                .map(tangram => (
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
          animation: "1000ms fadeIn 1000ms ease both",
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
