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
        css={{
          position: "fixed",
          left: "0",
          transform: `translate3d(${galleryOpened ? 0 : "-100vw"}, 0, 0)`,
          transition: "transform .3s ease",
          width: "100vw",
          height: "100%",
          background: "#ecf0f1",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 128px)",
          gridColumnGap: 3,
          gridRowGap: 3,
          justifyContent: "center",
          justifyItems: "center",
          alignItems: "center",
          overflow: "auto",
          p: 3,
        }}
        deps={[galleryOpened]}
      >
        {tangrams.group.map(({ fieldValue, nodes }) => (
          <React.Fragment key={fieldValue}>
            {fieldValue}
            {nodes
              .map(({ percent, ...node }) => {
                const difficulty = percent > 50 ? 0 : percent > 20 ? 1 : 2
                return {
                  ...node,
                  difficulty,
                }
              })
              .sort(
                ({ difficulty: difficultyA }, { difficulty: difficultyB }) => {
                  return difficultyA - difficultyB
                }
              )
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
          </React.Fragment>
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
