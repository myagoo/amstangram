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

  const handleTangramClick = svgContent => {
    setPendingSelectedTangrams(prevPendingSelectedTangrams => {
      if (prevPendingSelectedTangrams.includes(svgContent)) {
        return pendingSelectedTangrams.filter(tangram => tangram !== svgContent)
      }
      return [...pendingSelectedTangrams, svgContent]
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
      setSelectedTangrams(shuffle(tangrams))
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
        {tangrams.map(tangram => {
          return (
            <Card
              key={tangram.id}
              svg={tangram.content}
              difficulty={tangram.difficulty}
              completedEmoji={completedTangramsEmoji[tangram.id]}
              selected={pendingSelectedTangrams.includes(tangram)}
              onClick={() => handleTangramClick(tangram)}
            />
          )
        })}
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
            <View as={FiSave} />
          </Button>
        )}
        {galleryOpened && (
          <Button onClick={handleStartPlaylist}>
            <View as={pendingSelectedTangrams.length ? FiPlay : FiShuffle} />
          </Button>
        )}
        <Button onClick={handleGalleryToggle}>
          <View as={galleryOpened ? FiX : FiGrid} />
        </Button>
      </View>
    </>
  )
}
