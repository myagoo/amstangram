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
} from "../constants"
import { TangramsContext } from "../contexts/tangrams"
import { isTangramComplete } from "../utils/checkTangramCompleteness"
import { createPieces } from "../utils/createGroups"
import { getRandomEmoji } from "../utils/getRandomEmoji"
import { getScaleFactor } from "../utils/getScaleFactor"
import { getSnapVector } from "../utils/getSnapVector"
import { getSvg } from "../utils/getSvg"
import { isTangramValid } from "../utils/isTangramValid"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroups } from "../utils/scrambleGroups"
import { updateColisionState } from "../utils/updateColisionState"
import { Victory } from "./victory"

export const Tangram = () => {
  const theme = useContext(ThemeContext)
  const {
    setCompletedTangramEmoji,
    saveRequestId,
    selectedTangrams,
    setSelectedTangrams,
  } = useContext(TangramsContext)

  const [currentTangramIndex, setCurrentTangramIndex] = useState(0)
  const [victoryEmoji, setVictoryEmoji] = useState(null)

  const canvasRef = useRef()
  const groupsRef = useRef()
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
    if (saveRequestId) {
      if (isTangramValid(groupsRef.current)) {
        const scaleFactor = getScaleFactor(canvasRef.current)

        fetch(`/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getSvg(groupsRef.current, scaleFactor)),
        })
      } else {
        alert("Tangram is not valid")
      }
    }
  }, [canvasRef, saveRequestId, groupsRef])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && groupsRef.current) {
        for (const group of groupsRef.current) {
          // It seems that some android devices resize browser when switching activities
          restrictGroupWithinCanvas(group, canvasRef.current)
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
    const initParticles = () => {
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

      const colors = Object.values(theme.colors.pieces)

      const getRandomRadius = () =>
        Math.random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) +
        MIN_PARTICLE_SIZE

      const getRandomFillColor = () =>
        colors[Math.floor(Math.random() * colors.length)]

      const getRandomOpacity = () =>
        Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY

      particlesRef.current = new Array(PARTICLES_COUNT)

      for (let i = 0; i < PARTICLES_COUNT; i++) {
        const particle = new paper.Path.Circle({
          center: paper.Point.random().multiply(maxPoint),
          radius: getRandomRadius(),
          fillColor: getRandomFillColor(),
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
    }

    const attachGroupEvents = group => {
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

        anchorPoint = mdEvent.point.subtract(group.position)

        ghostGroup = group.clone({ insert: false, deep: true })

        group.bringToFront()
      }

      const handleMouseDrag = mdEvent => {
        document.body.style.cursor = "move"

        const newAnchorPoint = mdEvent.point.subtract(group.position)

        const vector = newAnchorPoint.subtract(anchorPoint)

        ghostGroup.position = group.position.add(vector)

        const ghostShape = ghostGroup.firstChild

        const otherShapes = groupsRef.current
          .filter(otherGroup => otherGroup !== group)
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

        group.position = ghostGroup.position

        updateColisionState(group, groupsRef.current, theme.colors)
      }

      const handleMouseUp = muEvent => {
        document.body.style.cursor = "pointer"

        if (
          muEvent.point.subtract(mouseDownPoint).length < SNAP_DISTANCE &&
          Date.now() - mouseDownTimestamp < CLICK_TIMEOUT
        ) {
          group.rotation += 45
          if (group.data.id === "rh") {
            group.data.rotation += 45
            if (group.data.rotation === 180) {
              group.data.rotation = 0
              group.scale(-1, 1) // Horizontal flip
            }
          }

          restrictGroupWithinCanvas(group, canvasRef.current)

          updateColisionState(group, groupsRef.current, theme.colors)

          mouseDownTimestamp = null
          mouseDownPoint = null
        }

        anchorPoint = null
        ghostGroup && ghostGroup.remove()
        ghostGroup = null

        if (isTangramComplete(coumpoundPathRef.current, groupsRef.current)) {
          const emoji = getRandomEmoji()

          setCompletedTangramEmoji(selectedTangram, emoji)

          for (const group of groupsRef.current) {
            group.data.removeListeners()
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

      group.on({
        mouseenter: handleMouseEnter,
        mouseleave: handleMouseLeave,
        mousedown: handleMouseDown,
        mousedrag: handleMouseDrag,
        mouseup: handleMouseUp,
      })

      group.data.removeListeners = () =>
        group.off({
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          mousedown: handleMouseDown,
          mousedrag: handleMouseDrag,
          mouseup: handleMouseUp,
        })
    }

    const init = () => {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()

      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      paper.setup(canvasRef.current)

      groupsRef.current = createPieces(theme.colors.pieces)

      const largeTriangle = groupsRef.current[3]

      const scaleFactor = getScaleFactor(canvasRef.current)

      const newBounds = {
        ...paper.project.view.bounds,
        width: largeTriangle.bounds.width * scaleFactor,
        height: largeTriangle.bounds.height * scaleFactor,
      }

      paper.project.activeLayer.fitBounds(newBounds)

      scrambleGroups(groupsRef.current, canvasRef.current)

      for (const group of groupsRef.current) {
        attachGroupEvents(group)
        restrictGroupWithinCanvas(group, canvasRef.current)
      }

      for (const group of groupsRef.current) {
        updateColisionState(group, groupsRef.current, theme.colors)
      }

      if (selectedTangram) {
        const coumpoundPath = paper.project.importSVG(
          `<path d="${selectedTangram.path}" />`,
          {
            applyMatrix: true,
          }
        )

        const scaleFactor = getScaleFactor(canvasRef.current)

        coumpoundPath.sendToBack()
        coumpoundPath.position = paper.view.center
        coumpoundPath.fillRule = "evenodd"
        coumpoundPath.fillColor = "black"

        if (DEV) {
          coumpoundPath.strokeWidth = 2
          coumpoundPath.strokeColor = "red"
        }

        coumpoundPath.closed = true
        coumpoundPath.scale(scaleFactor)

        coumpoundPathRef.current = coumpoundPath
      }

      initParticles()
    }

    init()

    return () => {
      paper.project.remove()
    }
  }, [theme.colors, selectedTangram, setCompletedTangramEmoji])

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
            animation: "1000ms fadeIn 0ms ease both",
          }}
        />
      </View>
      <View
        as="canvas"
        ref={canvasRef}
        css={{
          flex: 1,
          animation: "1000ms fadeIn 500ms ease both",
        }}
        resize="true"
      />

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
