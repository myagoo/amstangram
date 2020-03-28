import { ThemeContext } from "css-system"
import paper from "paper/dist/paper-core"
import React, {
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
  SNAP_DISTANCE,
  VICTORY_PARTICLES_DURATION,
  FADEIN_TRANSITION_DURATION,
  FADEIN_STAGGER_DURATION,
} from "../constants"
import { TangramsContext } from "../contexts/tangrams"
import { isTangramComplete } from "../utils/checkTangramCompleteness"
import { createPiecesGroup } from "../utils/createPiecesGroup"
import { getRandomEmoji } from "../utils/getRandomEmoji"
import { getSnapVector } from "../utils/getSnapVector"
import { getSvg } from "../utils/getSvg"
import { isTangramValid } from "../utils/isTangramValid"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroup } from "../utils/scrambleGroup"
import { updateColisionState } from "../utils/updateColisionState"
import { Victory } from "./victory"
import { Button } from "./button"
import { FiPlay, FiSquare } from "react-icons/fi"

export const Tangram = () => {
  const theme = useContext(ThemeContext)
  const {
    categories,
    setCompletedTangramEmoji,
    saveRequestId,
    selectedTangrams,
    setSelectedTangrams,
  } = useContext(TangramsContext)

  const [currentTangramIndex, setCurrentTangramIndex] = useState(0)
  const [victoryEmoji, setVictoryEmoji] = useState(null)

  const canvasRef = useRef()
  const scaleFactorRef = useRef()
  const piecesGroupRef = useRef()
  const particlesRef = useRef()
  const coumpoundPathRef = useRef()

  const selectedTangram = useMemo(() => {
    if (selectedTangrams.length === 0) {
      return null
    }
    return selectedTangrams[currentTangramIndex]
  }, [selectedTangrams, currentTangramIndex])

  const handleNext = () => {
    setCurrentTangramIndex(currentTangramIndex + 1)
  }

  const handleStop = () => {
    setSelectedTangrams([])
  }

  useEffect(() => {
    setCurrentTangramIndex(0)
  }, [selectedTangrams])

  // Handle save tangram request
  useEffect(() => {
    if (saveRequestId && DEV) {
      if (isTangramValid(piecesGroupRef.current)) {
        const category =
          prompt("Categorie:\n" + categories.join("\n")) || "misc"
        const name = prompt("Name:") || Date.now()
        const emoji = prompt("Emoji:") || undefined

        fetch(`/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...getSvg(piecesGroupRef.current, scaleFactorRef.current),
            category,
            emoji,
            name,
          }),
        })
      } else {
        alert("Tangram is not valid")
      }
    }
  }, [saveRequestId, categories])

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
    const attachPieceGroupEvents = pieceGroup => {
      let anchorPoint = null
      let ghostGroup = null
      let mouseDownTimestamp = null
      let mouseDownPoint = null

      const handleMouseEnter = mdEvent => {
        document.body.style.cursor = "pointer"
      }

      const handleMouseLeave = mdEvent => {
        document.body.style.cursor = "default"
      }

      const handleMouseDown = mdEvent => {
        mouseDownTimestamp = Date.now()
        mouseDownPoint = mdEvent.point

        anchorPoint = mdEvent.point.subtract(pieceGroup.position)

        ghostGroup = pieceGroup.clone({ insert: false, deep: true })

        pieceGroup.bringToFront()
      }

      const handleMouseDrag = mdEvent => {
        document.body.style.cursor = "move"

        const newAnchorPoint = mdEvent.point.subtract(pieceGroup.position)

        const vector = newAnchorPoint.subtract(anchorPoint)

        ghostGroup.position = pieceGroup.position.add(vector)

        const ghostShape = ghostGroup.firstChild

        const otherShapes = piecesGroupRef.current.children
          .filter(otherGroup => otherGroup !== pieceGroup)
          .map(({ firstChild }) => firstChild)

        const coumpoundShapes = coumpoundPathRef.current
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

      const handleMouseUp = muEvent => {
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

        if (
          isTangramComplete(coumpoundPathRef.current, piecesGroupRef.current)
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
                "position.x": paper.view.center.x,
                "position.y": paper.view.center.y,
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
        coumpoundPathRef.current.fillColor = "black"

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
      pieceGroup.firstChild.fillColor = theme.colors.pieces[pieceGroup.data.id]
      pieceGroup.lastChild.strokeColor = theme.colors.pieces[pieceGroup.data.id]
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
      }}
    >
      <View
        css={{
          p: 3,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: -1,
        }}
      >
        <View
          as={Logo}
          css={{
            alignSelf: "center",
            width: "100%",
            maxWidth: "400px",
            animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${FADEIN_STAGGER_DURATION *
              0}ms ease both`,
          }}
        />
      </View>
      <View
        as="canvas"
        ref={canvasRef}
        css={{
          flex: 1,
          animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${FADEIN_STAGGER_DURATION *
            1}ms ease both`,
        }}
        resize="true"
      />
      {DEV &&
        selectedTangrams.length > 0 &&
        currentTangramIndex < selectedTangrams.length - 1 && (
          <Button
            css={{ position: "fixed", right: 3, top: 3 }}
            onClick={handleNext}
          >
            <View as={FiPlay} css={{ m: "auto" }}></View>
          </Button>
        )}
      {DEV && selectedTangrams.length > 0 && (
        <Button
          css={{ position: "fixed", left: 3, top: 3 }}
          onClick={handleStop}
        >
          <View as={FiSquare} css={{ m: "auto" }}></View>
        </Button>
      )}
      {victoryEmoji && (
        <Victory
          emoji={victoryEmoji}
          onStop={handleStop}
          onNext={
            currentTangramIndex < selectedTangrams.length - 1
              ? handleNext
              : undefined
          }
        />
      )}
    </View>
  )
}
