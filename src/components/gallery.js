import React, { useContext, useState } from "react"
import paper from "paper/dist/paper-core"
import {
  FiGrid,
  FiPlay,
  FiSave,
  FiShuffle,
  FiX,
  FiSun,
  FiMoon,
  FiStar,
} from "react-icons/fi"
import {
  DEV,
  COLOR_TRANSITION_DURATION,
  FADEIN_TRANSITION_DURATION,
  FADEIN_STAGGER_DURATION,
  MIN_LENGTH,
  MAX_LENGTH,
} from "../constants"
import { TangramsContext } from "../contexts/tangrams"
import { shuffle } from "../utils/shuffle"
import { Button } from "./button"
import { Card } from "./card"
import { View } from "./view"
import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"

export const Gallery = () => {
  const [themeKey, switchTheme] = useSwitchTheme()
  const [
    showBackgroundPattern,
    toggleShowBackgroundPattern,
  ] = useShowBackgroundPattern()

  const {
    tangramsByGroup,
    completedTangramsEmoji,
    requestSave,
    setPlaylist,
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
    setPlaylist(
      pendingSelectedTangrams.length
        ? pendingSelectedTangrams
        : shuffle(Object.values(tangramsByGroup).flat())
    )
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

  const doMagic = () => {
    if (
      !window.confirm(
        "Vous êtes sur le point de recalculer la length et le percent de tous les tangrams. Êtes vous sûr ?"
      )
    ) {
      return
    }
    const project = new paper.Project()

    const fixedTangrams = Object.values(tangramsByGroup)
      .flat()
      .map(({ path, width, height, order, emoji, category, label, parent }) => {
        const length = project.importSVG(`<path d="${path}" />`, {
          applyMatrix: true,
          insert: false,
        }).length

        const percent = Math.floor(
          ((length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100
        )

        return {
          path,
          width,
          height,
          order,
          emoji,
          category,
          label,
          filename: parent.name,
          length,
          percent,
        }
      })

    project.remove()

    console.log(fixedTangrams)

    fetch(`/magic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixedTangrams),
    })
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
        {DEV && (
          <Button onClick={doMagic}>
            <View as={FiStar} css={{ m: "auto" }} />
          </Button>
        )}
        {galleryOpened && (
          <>
            <Button onClick={toggleShowBackgroundPattern}>
              <View
                as="svg"
                viewBox={`-30 -30 413.55 413.55`}
                stroke="currentColor"
                strokeWidth={30}
                strokeLinejoin="round"
                strokeDasharray={showBackgroundPattern ? 60 : undefined}
                fill={showBackgroundPattern ? "transparent" : "currentColor"}
                css={{
                  m: "auto",
                  height: "36px",
                }}
              >
                <path d="M353.55339,302.84271l-70.71068,70.71068l-212.13203,0l-70.71068,-70.71068zM184.4269,282.84271v-141.42136l141.42136,-141.42136l0,141.42136z"></path>
              </View>
            </Button>
            <Button
              onClick={() =>
                switchTheme(themeKey === "dark" ? "light" : "dark")
              }
            >
              <View
                as={themeKey === "dark" ? FiSun : FiMoon}
                css={{ m: "auto" }}
              />
            </Button>
            <Button onClick={handleStartPlaylist}>
              <View
                as={pendingSelectedTangrams.length ? FiPlay : FiShuffle}
                css={{ m: "auto" }}
              />
            </Button>
          </>
        )}

        <Button onClick={handleGalleryToggle}>
          <View as={galleryOpened ? FiX : FiGrid} css={{ m: "auto" }} />
        </Button>
      </View>
    </>
  )
}
