import { ThemeContext } from "css-system"
import firebase from "gatsby-plugin-firebase"
import paper from "paper/dist/paper-core"
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Logo } from "../components/logo"
import { View } from "../components/view"
import {
  CLICK_TIMEOUT,
  DEV,
  FADEIN_STAGGER_DURATION,
  FADEIN_TRANSITION_DURATION,
  SNAP_DISTANCE,
  SOFT_ERROR_MARGIN,
  STRICT_ERROR_MARGIN,
  VICTORY_PARTICLES_DURATION,
} from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { NotifyContext } from "../contexts/notify"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { UserContext } from "../contexts/user"
import { createPiecesGroup } from "../utils/createPiecesGroup"
import { getPathData } from "../utils/getPathData"
import { getRandomEmoji } from "../utils/getRandomEmoji"
import { getSnapVector } from "../utils/getSnapVector"
import { isTangramComplete } from "../utils/isTangramComplete"
import { isTangramValid } from "../utils/isTangramValid"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroup } from "../utils/scrambleGroup"
import { updateColisionState } from "../utils/updateColisionState"
import { Card } from "./card"
import { TangramMenu } from "./tangramMenu"
import { Victory } from "./victory"
import { useTranslate } from "../contexts/language"

export const Tangram = () => {
  const t = useTranslate()
  const { getCurrentUserRef, currentUser } = useContext(UserContext)
  const theme = useContext(ThemeContext)
  const notify = useContext(NotifyContext)

  const [showBackgroundPattern] = useShowBackgroundPattern()
  const {
    getTangramRef,
    setCompletedTangramEmoji,
    saveRequestId,
    playlist,
    setPlaylist,
  } = useContext(GalleryContext)

  const [currentTangramIndex, setCurrentTangramIndex] = useState(0)
  const [victoryEmoji, setVictoryEmoji] = useState(null)

  const canvasRef = useRef()
  const scaleFactorRef = useRef()
  const piecesGroupRef = useRef()
  const particlesRef = useRef()
  const coumpoundPathRef = useRef()
  const showBackgroundPatternRef = useRef()

  const selectedTangram = useMemo(() => {
    return playlist && playlist[currentTangramIndex]
  }, [playlist, currentTangramIndex])

  const handleNext = () => {
    setCurrentTangramIndex(currentTangramIndex + 1)
  }

  const handleStop = useCallback(() => {
    setPlaylist(null)
  }, [setPlaylist])

  const handleApprove = async () => {
    await firebase
      .firestore()
      .collection("tangrams")
      .doc(selectedTangram.id)
      .update({ approved: true })
    notify(t("Tangram approved"))
  }

  useEffect(() => {
    setCurrentTangramIndex(0)
  }, [playlist])

  // Handle save tangram request
  useEffect(() => {
    if (saveRequestId) {
      if (!isTangramValid(piecesGroupRef.current)) {
        notify(t("You can't save an invalid tangram"))
        return
      }

      const handleSaveRequest = DEV
        ? async () => {
            const tangram = await getTangramRef.current(
              getPathData(piecesGroupRef.current, scaleFactorRef.current)
            )
            await firebase.firestore().collection("tangrams").add(tangram)

            notify(t("Tangram added to base gallery"))
          }
        : async () => {
            const user = await getCurrentUserRef.current()
            const tangram = await getTangramRef.current({
              ...getPathData(piecesGroupRef.current, scaleFactorRef.current),
              uid: user.uid,
            })
            await firebase
              .firestore()
              .collection("tangrams")
              .add({
                ...tangram,
                approved: false,
              })
            notify(t("Tangram submitted for review"))
          }

      handleSaveRequest()
    }
  }, [notify, saveRequestId, getTangramRef, getCurrentUserRef, t])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && piecesGroupRef.current) {
        for (const pieceGroup of piecesGroupRef.current.children) {
          // It seems that some android devices resize browser when switching activities
          restrictGroupWithinCanvas(pieceGroup, canvasRef.current)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setVictoryEmoji(null)
  }, [selectedTangram])

  // Init a game
  useLayoutEffect(() => {
    const attachPieceGroupEvents = (pieceGroup) => {
      let anchorPoint = null
      let ghostGroup = null
      let mouseDownTimestamp = null
      let mouseDownPoint = null

      const handleMouseEnter = (mdEvent) => {
        if (document.activeElement === canvasRef.current) {
          document.body.style.cursor = "pointer"
        }
      }

      const handleMouseLeave = (mdEvent) => {
        document.body.style.cursor = "default"
      }

      const handleMouseDown = (mdEvent) => {
        mouseDownTimestamp = Date.now()
        mouseDownPoint = mdEvent.point

        anchorPoint = mdEvent.point.subtract(pieceGroup.position)

        ghostGroup = pieceGroup.clone({ insert: false, deep: true })

        pieceGroup.bringToFront()
      }

      const handleMouseDrag = (mdEvent) => {
        document.body.style.cursor = "move"

        const newAnchorPoint = mdEvent.point.subtract(pieceGroup.position)

        const vector = newAnchorPoint.subtract(anchorPoint)

        ghostGroup.position = pieceGroup.position.add(vector)

        const ghostShape = ghostGroup.children["display 1"]

        const otherShapes = piecesGroupRef.current.children
          .filter((otherGroup) => otherGroup !== pieceGroup)
          .map(({ children }) => children["display"])

        const coumpoundShapes =
          playlist &&
          showBackgroundPatternRef.current &&
          coumpoundPathRef.current
            ? coumpoundPathRef.current.children
              ? coumpoundPathRef.current.children
              : [coumpoundPathRef.current]
            : null

        const snapVector = getSnapVector(
          SNAP_DISTANCE,
          ghostShape,
          otherShapes,
          coumpoundShapes
        )

        if (snapVector) {
          ghostGroup.position.x += snapVector.x
          ghostGroup.position.y += snapVector.y
        }

        restrictGroupWithinCanvas(ghostGroup, canvasRef.current)

        if (DEV) {
          new paper.Path.Rectangle({
            rectangle: ghostGroup.bounds,
            strokeColor: "black",
          }).removeOn({ drag: true, move: true })
        }

        pieceGroup.position = ghostGroup.position

        updateColisionState(pieceGroup, piecesGroupRef.current)
      }

      const handleMouseUp = (muEvent) => {
        document.body.style.cursor = "pointer"

        if (
          muEvent.point.subtract(mouseDownPoint).length < SNAP_DISTANCE &&
          Date.now() - mouseDownTimestamp < CLICK_TIMEOUT
        ) {
          pieceGroup.rotation += 45
          if (pieceGroup.data.id === "rh") {
            pieceGroup.data.rotation += 45
            if (pieceGroup.data.rotation === 180) {
              pieceGroup.data.rotation = 0
              pieceGroup.scale(-1, 1) // Horizontal flip
            }
          }

          restrictGroupWithinCanvas(pieceGroup, canvasRef.current)

          updateColisionState(pieceGroup, piecesGroupRef.current)

          mouseDownTimestamp = null
          mouseDownPoint = null
        }

        anchorPoint = null
        ghostGroup && ghostGroup.remove()
        ghostGroup = null

        if (playlist === null) {
          return
        }

        if (showBackgroundPatternRef.current === false) {
          coumpoundPathRef.current.position = piecesGroupRef.current.position
        }

        if (
          isTangramComplete(
            coumpoundPathRef.current,
            piecesGroupRef.current,
            showBackgroundPatternRef.current
              ? STRICT_ERROR_MARGIN
              : SOFT_ERROR_MARGIN
          )
        ) {
          const emoji = selectedTangram.emoji
            ? selectedTangram.emoji
            : getRandomEmoji()

          setCompletedTangramEmoji(selectedTangram, emoji)

          for (const pieceGroup of piecesGroupRef.current.children) {
            pieceGroup.data.removeListeners()
          }

          for (const particle of particlesRef.current) {
            particle.data.animation.stop()
            particle.tween(
              {
                "position.x": piecesGroupRef.current.position.x,
                "position.y": piecesGroupRef.current.position.y,
                opacity: 0,
                radius: 0,
              },
              {
                duration: VICTORY_PARTICLES_DURATION,
                easing: "easeInCubic",
              }
            )
          }
          setTimeout(() => setVictoryEmoji(emoji), VICTORY_PARTICLES_DURATION)
        }
      }

      pieceGroup.on({
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        mousedown: handleMouseDown,
        mousedrag: handleMouseDrag,
        mouseup: handleMouseUp,
      })

      pieceGroup.data.removeListeners = () =>
        pieceGroup.off({
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          mousedown: handleMouseDown,
          mousedrag: handleMouseDrag,
          mouseup: handleMouseUp,
        })
    }

    const init = () => {
      paper.setup(canvasRef.current)

      piecesGroupRef.current = createPiecesGroup()

      if (selectedTangram) {
        coumpoundPathRef.current = paper.project.importSVG(
          `<path d="${selectedTangram.path}" />`,
          {
            applyMatrix: true,
          }
        )

        coumpoundPathRef.current.sendToBack()
        coumpoundPathRef.current.fillRule = "evenodd"

        if (DEV) {
          coumpoundPathRef.current.strokeWidth = 2
          coumpoundPathRef.current.strokeColor = "red"
        }

        coumpoundPathRef.current.closed = true
      }

      const outerBounds = paper.project.view.bounds
      const innerBounds = coumpoundPathRef.current
        ? coumpoundPathRef.current.bounds
        : piecesGroupRef.current.children[3].bounds.scale(2.5)

      if (outerBounds.width > outerBounds.height) {
        scaleFactorRef.current = Math.min(
          2,
          Math.min(outerBounds.width * 0.6, 700) / innerBounds.width,
          Math.min(outerBounds.height * 0.8, 600) / innerBounds.height
        )
      } else {
        scaleFactorRef.current = Math.min(
          2,
          Math.min(outerBounds.width * 0.8, 600) / innerBounds.width,
          Math.min(outerBounds.height * 0.6, 700) / innerBounds.height
        )
      }

      if (coumpoundPathRef.current) {
        coumpoundPathRef.current.scale(scaleFactorRef.current)

        paper.project.activeLayer.fitBounds(
          coumpoundPathRef.current.bounds,
          true
        )

        coumpoundPathRef.current.position = paper.view.center
      }

      for (const pieceGroup of piecesGroupRef.current.children) {
        pieceGroup.scale(scaleFactorRef.current)
        scrambleGroup(pieceGroup, canvasRef.current)
        attachPieceGroupEvents(pieceGroup)
        restrictGroupWithinCanvas(pieceGroup, canvasRef.current)
        updateColisionState(pieceGroup, piecesGroupRef.current)
      }
    }

    init()

    return () => {
      paper.project.remove()
      particlesRef.current = null
      piecesGroupRef.current = null
      coumpoundPathRef.current = null
    }
  }, [selectedTangram, setCompletedTangramEmoji])

  useLayoutEffect(() => {
    showBackgroundPatternRef.current = showBackgroundPattern
    if (!coumpoundPathRef.current) {
      return
    }

    if (showBackgroundPattern) {
      coumpoundPathRef.current.fillColor = "black"
      coumpoundPathRef.current.position = paper.view.center
    } else {
      coumpoundPathRef.current.fillColor = "transparent"
    }
  }, [selectedTangram, showBackgroundPattern])

  useLayoutEffect(() => {
    const particleGroup = new paper.Group()

    particleGroup.sendToBack()

    const PARTICLES_COUNT = 60
    const MAX_PARTICLE_SIZE = 5
    const MIN_PARTICLE_SIZE = 2
    const MIN_OPACITY = 0.1
    const MAX_OPACITY = 0.5

    const maxPoint = new paper.Point(
      canvasRef.current.width,
      canvasRef.current.height
    ).divide(window.devicePixelRatio)

    const getRandomRadius = () =>
      Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) +
      MIN_PARTICLE_SIZE

    const getRandomOpacity = () =>
      Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY

    particlesRef.current = new Array(PARTICLES_COUNT)

    for (let i = 0; i < PARTICLES_COUNT; i++) {
      const particle = new paper.Path.Circle({
        center: paper.Point.random().multiply(maxPoint),
        radius: getRandomRadius(),
        opacity: getRandomOpacity(),
        parent: particleGroup,
        data: { index: i },
      })

      const randomize = () => {
        const values = {
          radius: getRandomRadius(),
          opacity: getRandomOpacity(),
          "position.x": Math.min(
            canvasRef.current.width / window.devicePixelRatio,
            Math.max(0, particle.position.x + Math.random() * 200 - 100)
          ),
          "position.y": Math.min(
            canvasRef.current.height / window.devicePixelRatio,
            Math.max(0, particle.position.y + Math.random() * 200 - 100)
          ),
        }

        particle.data.animation = particle
          .tween(values, {
            duration: Math.random() * 10000 + 5000,
            easing: "easeInOutQuad",
          })
          .then(randomize)
      }

      randomize()

      particlesRef.current[i] = particle
    }
  }, [selectedTangram])

  useLayoutEffect(() => {
    for (const pieceGroup of piecesGroupRef.current.children) {
      pieceGroup.children["display"].fillColor =
        theme.colors.pieces[pieceGroup.data.id]
      pieceGroup.children["insetBorder"].strokeColor =
        theme.colors.pieces[pieceGroup.data.id]
    }

    const pieceColors = Object.values(theme.colors.pieces)

    for (const particle of particlesRef.current) {
      particle.fillColor =
        pieceColors[Math.floor(Math.random() * pieceColors.length)]
    }
  }, [theme.colors, selectedTangram])

  return (
    <View
      css={{
        flex: "1",
        position: "relative",
        color: "galleryText",
      }}
    >
      {!selectedTangram && (
        <View
          css={{
            p: 3,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: -1,
            animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${
              FADEIN_STAGGER_DURATION * 0
            }ms ease both`,
          }}
        >
          <View
            as={Logo}
            css={{
              alignSelf: "center",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </View>
      )}
      {selectedTangram && showBackgroundPattern === false && (
        <View
          css={{
            zIndex: -1,
            position: "absolute",
            top: 3,
            right: 3,
            cursor: "pointer",
          }}
        >
          <Card tangram={selectedTangram} selected></Card>
        </View>
      )}
      <View
        as="canvas"
        ref={canvasRef}
        css={{
          minHeight: "auto",
          flex: 1,
          animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${
            FADEIN_STAGGER_DURATION * 1
          }ms ease both`,
        }}
      />

      {playlist && victoryEmoji && (
        <Victory
          emoji={victoryEmoji}
          onStop={handleStop}
          onNext={
            currentTangramIndex < playlist.length - 1 ? handleNext : undefined
          }
          onApprove={
            currentUser &&
            currentUser.isAdmin &&
            playlist &&
            selectedTangram.uid &&
            !selectedTangram.approved
              ? handleApprove
              : undefined
          }
        />
      )}
      <TangramMenu></TangramMenu>
    </View>
  )
}
