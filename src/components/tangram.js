import { ThemeContext } from "css-system"
import firebase from "gatsby-plugin-firebase"
import paper from "paper/dist/paper-core"
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useIntl } from "react-intl"
import { View } from "../components/view"
import {
  CLICK_TIMEOUT,
  FADE_TRANSITION_DURATION,
  SNAP_DISTANCE,
  SOFT_ERROR_MARGIN,
  STRICT_ERROR_MARGIN,
  VICTORY_PARTICLES_DURATION,
  PARTICLES_COUNT,
  MIN_PARTICLE_OPACITY,
  MIN_PARTICLE_SIZE,
  MAX_PARTICLE_SIZE,
  MAX_PARTICLE_OPACITY,
} from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { NotifyContext } from "../contexts/notify"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { SoundContext } from "../contexts/sound"
import { TipsContext } from "../contexts/tips"
import { UserContext } from "../contexts/user"
import { createPiecesGroup } from "../utils/createPiecesGroup"
import { getPathData } from "../utils/getPathData"
import { getSnapVector } from "../utils/getSnapVector"
import { isTangramComplete } from "../utils/isTangramComplete"
import { isTangramValid } from "../utils/isTangramValid"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroup } from "../utils/scrambleGroup"
import { updateColisionState } from "../utils/updateColisionState"
import { Card } from "./card"
import { Victory } from "./victory"

export const Tangram = () => {
  const intl = useIntl()
  const { showRandomTip, showWelcome } = useContext(TipsContext)

  const { showLogin, showTangram } = useContext(DialogContext)
  const { playTangram, playVictory } = useContext(SoundContext)
  const playRef = useRef()
  playRef.current = {
    tangram: playTangram,
    victory: playVictory,
  }

  const { currentUser } = useContext(UserContext)
  const currentUserRef = useRef()
  currentUserRef.current = currentUser
  const theme = useContext(ThemeContext)
  const notify = useContext(NotifyContext)
  const [showBackgroundPattern] = useShowBackgroundPattern()
  const {
    saveRequestId,
    playlist,
    setPlaylist,
    markTangramAsComplete,
    toggleTangramStar,
  } = useContext(GalleryContext)

  const markTangramAsCompleteRef = useRef()
  markTangramAsCompleteRef.current = markTangramAsComplete

  const [currentTangramIndex, setCurrentTangramIndex] = useState(0)
  const [victoryPhase, setVictoryPhase] = useState(false)

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
    setVictoryPhase(false)
    setCurrentTangramIndex(currentTangramIndex + 1)
    showRandomTip()
  }

  const handleStop = () => {
    setVictoryPhase(false)
    setPlaylist(null)
    showRandomTip()
  }

  const handleApprove = async () => {
    await firebase
      .firestore()
      .collection("tangrams")
      .doc(selectedTangram.id)
      .update({ approved: true })

    notify(intl.formatMessage({ id: "Tangram approved" }))
  }

  useEffect(() => {
    setCurrentTangramIndex(0)
  }, [playlist])

  // Handle save tangram request
  useEffect(() => {
    if (saveRequestId) {
      if (!isTangramValid(piecesGroupRef.current)) {
        notify(intl.formatMessage({ id: "You can't save an invalid tangram" }))
        return
      }

      const pathData = getPathData(
        piecesGroupRef.current,
        scaleFactorRef.current
      )

      if (pathData.edges === 23) {
        notify(
          intl.formatMessage({ id: "You can't save such an easy tangram" })
        )
        return
      }

      const asyncTask = async () => {
        if (!currentUser) {
          await showLogin()
        }
        await showTangram(pathData)
      }

      asyncTask()
    }
  }, [saveRequestId])

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

  // Init a game
  useLayoutEffect(() => {
    const start = Date.now()
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
          showBackgroundPatternRef.current && coumpoundPathRef.current
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
          playRef.current.tangram()

          restrictGroupWithinCanvas(pieceGroup, canvasRef.current)

          updateColisionState(pieceGroup, piecesGroupRef.current)

          mouseDownTimestamp = null
          mouseDownPoint = null
        }

        anchorPoint = null
        ghostGroup && ghostGroup.remove()
        ghostGroup = null

        if (!coumpoundPathRef.current) {
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
          markTangramAsCompleteRef.current(selectedTangram, Date.now() - start)

          for (const pieceGroup of piecesGroupRef.current.children) {
            pieceGroup.data.removeListeners()
          }
          document.body.style.cursor = "default"

          paper.project.activeLayer.tween(
            {
              opacity: 0,
            },
            {
              duration: VICTORY_PARTICLES_DURATION,
              easing: "easeInCubic",
            }
          )

          for (const particle of particlesRef.current) {
            particle.data.animation.stop()

            particle.tween(
              {
                "position.x": piecesGroupRef.current.position.x,
                "position.y": piecesGroupRef.current.position.y,
                opacity: MAX_PARTICLE_OPACITY,
              },
              {
                duration: VICTORY_PARTICLES_DURATION,
                easing: "easeInCubic",
              }
            )
          }
          setTimeout(() => {
            playRef.current.victory()
            paper.project.activeLayer.tween(
              {
                opacity: 1,
              },
              {
                duration: FADE_TRANSITION_DURATION,
                easing: "easeOutCubic",
              }
            )

            const maxDistance =
              Math.max(paper.view.bounds.width, paper.view.bounds.height) / 2

            for (const particle of particlesRef.current) {
              particle.data.animation.stop()

              const angle = Math.random() * Math.PI * 2
              const distance = Math.random() * maxDistance
              particle.tween(
                {
                  "position.x":
                    particle.position.x + distance * Math.cos(angle),
                  "position.y":
                    particle.position.y + distance * Math.sin(angle),
                  opacity: 0,
                },
                {
                  duration: VICTORY_PARTICLES_DURATION,
                  easing: "easeOutCubic",
                }
              )
            }
            setVictoryPhase(true)
          }, VICTORY_PARTICLES_DURATION)
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

        coumpoundPathRef.current.closed = true
      }

      const outerBounds = paper.project.view.bounds
      const innerBounds = coumpoundPathRef.current
        ? coumpoundPathRef.current.bounds
        : piecesGroupRef.current.children[3].bounds.scale(2)

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
  }, [selectedTangram])

  useLayoutEffect(() => {
    showBackgroundPatternRef.current = showBackgroundPattern
    if (!coumpoundPathRef.current) {
      return
    }

    if (showBackgroundPattern) {
      coumpoundPathRef.current.fillColor = theme.colors.shape
      coumpoundPathRef.current.position = paper.view.center
    } else {
      coumpoundPathRef.current.fillColor = "transparent"
    }
  }, [selectedTangram, showBackgroundPattern, theme])

  useLayoutEffect(() => {
    const particleGroup = new paper.Group()

    particleGroup.sendToBack()

    const maxPoint = new paper.Point(
      canvasRef.current.width,
      canvasRef.current.height
    ).divide(window.devicePixelRatio)

    const getRandomRadius = () =>
      Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) +
      MIN_PARTICLE_SIZE

    const getRandomOpacity = () =>
      Math.random() * (MAX_PARTICLE_OPACITY - MIN_PARTICLE_OPACITY) +
      MIN_PARTICLE_OPACITY

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

  useEffect(() => {
    showWelcome()
  }, [])

  return (
    <View
      css={{
        flex: "1",
        position: "relative",
        color: "dialogText",
        animation: `${FADE_TRANSITION_DURATION}ms fadeIn ease`,
      }}
    >
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
          <Card tangram={selectedTangram} selected hideBadge></Card>
        </View>
      )}
      <View
        as="canvas"
        ref={canvasRef}
        css={{
          minHeight: "auto",
          flex: 1,
        }}
      />

      {selectedTangram && victoryPhase && (
        <Victory
          tangram={selectedTangram}
          onStop={handleStop}
          onNext={
            currentTangramIndex < playlist.length - 1 ? handleNext : undefined
          }
          onApprove={
            currentUser && currentUser.isAdmin && !selectedTangram.approved
              ? handleApprove
              : undefined
          }
          onStarToggle={
            currentUser && selectedTangram.approved
              ? () => toggleTangramStar(selectedTangram)
              : undefined
          }
        />
      )}
    </View>
  )
}
