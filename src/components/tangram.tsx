import { ThemeContext } from "../utils/styles"
import paper from "paper/dist/paper-core"
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { useIntl } from "react-intl"
import {
  CLICK_TIMEOUT,
  FADE_TRANSITION_DURATION,
  MAX_PARTICLE_OPACITY,
  MAX_PARTICLE_SIZE,
  MIN_PARTICLE_OPACITY,
  MIN_PARTICLE_SIZE,
  PARTICLES_COUNT,
  SNAP_DISTANCE,
  SOFT_ERROR_MARGIN,
  STRICT_ERROR_MARGIN,
  VICTORY_PARTICLES_DURATION,
} from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"
import { NotifyContext } from "../contexts/notify"
import { useShowBackgroundPattern } from "../contexts/showBackgroundPattern"
import { useShowParticles } from "../contexts/showParticles"
import { SoundContext } from "../contexts/sound"
import { TipsContext } from "../contexts/tips"
import { UserContext } from "../contexts/user"
import { createPiecesGroup } from "../utils/createPiecesGroup"
import { createGameRandom, createRandom } from "../utils/createRandom"
import firebase from "../utils/firebase"
import { getPathData } from "../utils/getPathData"
import { getSnapVector } from "../utils/getSnapVector"
import { isTangramComplete } from "../utils/isTangramComplete"
import { isTangramValid } from "../utils/isTangramValid"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroup } from "../utils/scrambleGroup"
import { updateColisionState } from "../utils/updateColisionState"
import { Card } from "./card"
import { Victory } from "./victory"
import { View, CanvasView } from "./view"

import type { TanGroup, PiecesGroup, Outline } from "../types"
import { useNextGeneratedTangram } from "../generation/useNextGeneratedTangram"

interface Particle extends paper.Path {
  data: { index: number; animation: paper.Tween }
}

export const Tangram = () => {
  const intl = useIntl()
  const { showRandomTip, showWelcome } = useContext(TipsContext)

  const { showLogin, showTangram } = useContext(DialogContext)
  const { playTangram, playVictory } = useContext(SoundContext)
  const playRef = useRef({ tangram: playTangram, victory: playVictory })
  playRef.current = {
    tangram: playTangram,
    victory: playVictory,
  }

  const { currentUser } = useContext(UserContext)
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser
  const theme = useContext(ThemeContext)
  const notify = useContext(NotifyContext)
  const [showBackgroundPattern] = useShowBackgroundPattern()
  const [showParticles] = useShowParticles()
  const {
    saveRequestId,
    playlist,
    currentTangramIndex,
    advancePlaylist,
    setPlaylist,
    markTangramAsComplete,
    toggleTangramStar,
  } = useContext(GalleryContext)

  const markTangramAsCompleteRef = useRef(markTangramAsComplete)
  markTangramAsCompleteRef.current = markTangramAsComplete

  const [victoryPhase, setVictoryPhase] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scaleFactorRef = useRef(1)
  const piecesGroupRef = useRef<PiecesGroup | null>(null)
  const particlesRef = useRef<Particle[] | null>(null)
  const stopParticlesRef = useRef<(() => void) | null>(null)
  const coumpoundPathRef = useRef<Outline | null>(null)
  const showBackgroundPatternRef = useRef(showBackgroundPattern)
  const showParticlesRef = useRef(showParticles)

  const selectedTangram = playlist?.[currentTangramIndex]
  const [previewTangram, setPreviewTangram] = useState(selectedTangram)
  const generated = !!selectedTangram && !selectedTangram.id
  const {
    next,
    failed: nextFailed,
    retry: retryNext,
  } = useNextGeneratedTangram(selectedTangram)

  useEffect(() => {
    setVictoryPhase(false)
  }, [selectedTangram])

  const handleNext = () => {
    if (generated) {
      if (nextFailed) {
        retryNext()
        return
      }
      if (!next) return
      setPlaylist([next])
    } else {
      advancePlaylist()
    }
    setVictoryPhase(false)
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
      .doc(selectedTangram!.id)
      .update({ approved: true })

    notify(intl.formatMessage({ id: "Tangram approved" }))
  }

  // Handle save tangram request
  useEffect(() => {
    if (saveRequestId) {
      if (!isTangramValid(piecesGroupRef.current!)) {
        notify(intl.formatMessage({ id: "You can't save an invalid tangram" }))
        return
      }

      const pathData = getPathData(
        piecesGroupRef.current!,
        scaleFactorRef.current
      )

      if (pathData.edges === 23) {
        notify(
          intl.formatMessage({ id: "You can't save such an easy tangram" })
        )
        return
      }

      const asyncTask = async () => {
        if (!currentUser && !(await showLogin())) return
        showTangram(pathData)
      }

      asyncTask()
    }
  }, [saveRequestId])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && piecesGroupRef.current!) {
        for (const pieceGroup of piecesGroupRef.current!.children) {
          // It seems that some android devices resize browser when switching activities
          restrictGroupWithinCanvas(pieceGroup, canvasRef.current!)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Init a game
  useLayoutEffect(() => {
    const start = Date.now()
    const victoryRandom = createGameRandom()
    let victoryTimeout: ReturnType<typeof setTimeout> | undefined
    let victoryAnimation: paper.Tween | undefined
    const attachPieceGroupEvents = (pieceGroup: TanGroup) => {
      let anchorPoint: paper.Point | null = null
      let ghostGroup: TanGroup | null = null
      let mouseDownTimestamp: number | null = null
      let mouseDownPoint: paper.Point | null = null

      const handleMouseEnter = (mdEvent: paper.MouseEvent) => {
        if (document.activeElement === canvasRef.current!) {
          document.body.style.cursor = "pointer"
        }
      }

      const handleMouseLeave = (mdEvent: paper.MouseEvent) => {
        document.body.style.cursor = "default"
      }

      const handleMouseDown = (mdEvent: paper.MouseEvent) => {
        mouseDownTimestamp = Date.now()
        mouseDownPoint = mdEvent.point

        anchorPoint = mdEvent.point.subtract(pieceGroup.position)

        ghostGroup = pieceGroup.clone({ insert: false, deep: true })

        pieceGroup.bringToFront()
      }

      const handleMouseDrag = (mdEvent: paper.MouseEvent) => {
        document.body.style.cursor = "move"

        const newAnchorPoint = mdEvent.point.subtract(pieceGroup.position)

        const vector = newAnchorPoint.subtract(anchorPoint!)

        ghostGroup!.position = pieceGroup.position.add(vector)

        const ghostShape = ghostGroup!.children["display 1"]

        const otherShapes = piecesGroupRef
          .current!.children.filter((otherGroup) => otherGroup !== pieceGroup)
          .map(({ children }) => children["display"])

        const coumpoundShapes =
          showBackgroundPatternRef.current && coumpoundPathRef.current
            ? coumpoundPathRef.current instanceof paper.CompoundPath
              ? (coumpoundPathRef.current.children as paper.Path[])
              : [coumpoundPathRef.current]
            : null

        const snapVector = getSnapVector(
          SNAP_DISTANCE,
          ghostShape,
          otherShapes,
          coumpoundShapes
        )

        if (snapVector) {
          ghostGroup!.position.x += snapVector.x
          ghostGroup!.position.y += snapVector.y
        }

        restrictGroupWithinCanvas(ghostGroup!, canvasRef.current!)

        pieceGroup.position = ghostGroup!.position

        updateColisionState(pieceGroup, piecesGroupRef.current!)
      }

      const handleMouseUp = (muEvent: paper.MouseEvent) => {
        document.body.style.cursor = "pointer"

        if (
          muEvent.point.subtract(mouseDownPoint!).length < SNAP_DISTANCE &&
          Date.now() - mouseDownTimestamp! < CLICK_TIMEOUT
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

          restrictGroupWithinCanvas(pieceGroup, canvasRef.current!)

          updateColisionState(pieceGroup, piecesGroupRef.current!)

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
          coumpoundPathRef.current.position = piecesGroupRef.current!.position
        }

        if (
          isTangramComplete(
            coumpoundPathRef.current,
            piecesGroupRef.current!,
            showBackgroundPatternRef.current
              ? STRICT_ERROR_MARGIN
              : SOFT_ERROR_MARGIN
          )
        ) {
          markTangramAsCompleteRef.current(selectedTangram!, Date.now() - start)

          for (const pieceGroup of piecesGroupRef.current!.children) {
            pieceGroup.data.removeListeners()
          }
          document.body.style.cursor = "default"

          if (!showParticlesRef.current) {
            playRef.current.victory()
            setVictoryPhase(true)
            return
          }

          victoryAnimation = project.activeLayer.tween(
            {
              opacity: 0,
            },
            {
              duration: VICTORY_PARTICLES_DURATION,
              easing: "easeInCubic",
            }
          )

          for (const particle of particlesRef.current!) {
            particle.data.animation.stop()

            particle.data.animation = particle.tween(
              {
                "position.x": piecesGroupRef.current!.position.x,
                "position.y": piecesGroupRef.current!.position.y,
                opacity: MAX_PARTICLE_OPACITY,
              },
              {
                duration: VICTORY_PARTICLES_DURATION,
                easing: "easeInCubic",
              }
            )
          }
          victoryTimeout = setTimeout(() => {
            playRef.current.victory()
            victoryAnimation = project.activeLayer.tween(
              {
                opacity: 1,
              },
              {
                duration: FADE_TRANSITION_DURATION,
                easing: "easeOutCubic",
              }
            )

            const maxDistance =
              Math.max(project.view.bounds.width, project.view.bounds.height) /
              2

            for (const particle of particlesRef.current ?? []) {
              particle.data.animation.stop()

              const angle = victoryRandom() * Math.PI * 2
              const distance = victoryRandom() * maxDistance
              particle.data.animation = particle.tween(
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

      pieceGroup.data.removeListeners = () => {
        ghostGroup?.remove()
        ghostGroup = null
        pieceGroup.off({
          mouseenter: handleMouseEnter,
          mouseleave: handleMouseLeave,
          mousedown: handleMouseDown,
          mousedrag: handleMouseDrag,
          mouseup: handleMouseUp,
        })
      }
    }

    const init = () => {
      paper.setup(canvasRef.current!)

      const random = createGameRandom()
      piecesGroupRef.current = createPiecesGroup(random)

      if (selectedTangram) {
        coumpoundPathRef.current = paper.project.importSVG(
          `<path d="${selectedTangram.path}" />`,
          {
            applyMatrix: true,
          }
        ) as Outline

        coumpoundPathRef.current.sendToBack()
        coumpoundPathRef.current.fillRule = "evenodd"

        coumpoundPathRef.current.closed = true
      }

      const outerBounds = paper.project.view.bounds
      const innerBounds = coumpoundPathRef.current
        ? coumpoundPathRef.current.bounds
        : piecesGroupRef.current!.children[3].bounds.scale(2)
      const landscape = outerBounds.width > outerBounds.height
      const availableWidth = Math.min(
        outerBounds.width * (landscape ? 0.7 : 0.8),
        landscape ? 700 : 600
      )
      const availableHeight = Math.min(
        outerBounds.height * (landscape ? 0.8 : 0.7),
        landscape ? 600 : 700
      )
      const scale = Math.min(
        availableWidth / innerBounds.width,
        availableHeight / innerBounds.height
      )
      scaleFactorRef.current = scale
      setPreviewTangram(selectedTangram)
      if (selectedTangram && !selectedTangram.id) {
        const target = coumpoundPathRef.current!
        const candidate = target.clone({ insert: false })
        let bestAngle = 0
        for (const angle of [45, 90]) {
          candidate.rotate(45)
          const candidateScale = Math.min(
            availableWidth / candidate.bounds.width,
            availableHeight / candidate.bounds.height
          )
          if (candidateScale > scaleFactorRef.current + 1e-9) {
            bestAngle = angle
            scaleFactorRef.current = candidateScale
          }
        }
        candidate.remove()
        if (bestAngle) {
          target.rotate(bestAngle)
          target.translate(target.bounds.topLeft.multiply(-1))
          setPreviewTangram({
            ...selectedTangram,
            path: target.pathData,
            width: Math.round(target.bounds.width),
            height: Math.round(target.bounds.height),
          })
        }
      }

      if (coumpoundPathRef.current) {
        coumpoundPathRef.current.scale(scaleFactorRef.current)
        coumpoundPathRef.current.position = paper.view.center
      }

      for (const pieceGroup of piecesGroupRef.current!.children) {
        pieceGroup.scale(scaleFactorRef.current)
        scrambleGroup(pieceGroup, random)
        attachPieceGroupEvents(pieceGroup)
        restrictGroupWithinCanvas(pieceGroup, canvasRef.current!)
        updateColisionState(pieceGroup, piecesGroupRef.current!)
      }
    }

    init()
    const project = paper.project
    const pieces = piecesGroupRef.current!
    return () => {
      clearTimeout(victoryTimeout)
      victoryAnimation?.stop()
      // The project owns these resources; cleanup does not depend on effect order.
      stopParticlesRef.current?.()
      for (const piece of pieces.children) piece.data.removeListeners()
      project.remove()
      piecesGroupRef.current = null
      coumpoundPathRef.current = null
      document.body.style.cursor = "default"
    }
  }, [selectedTangram])

  useLayoutEffect(() => {
    showBackgroundPatternRef.current = showBackgroundPattern
    if (!coumpoundPathRef.current) {
      return
    }

    if (showBackgroundPattern) {
      coumpoundPathRef.current.fillColor = new paper.Color(theme.colors.shape)
      coumpoundPathRef.current.position = paper.view.center
    } else {
      coumpoundPathRef.current.fillColor = new paper.Color("transparent")
    }
  }, [selectedTangram, showBackgroundPattern, theme])

  useLayoutEffect(() => {
    showParticlesRef.current = showParticles

    if (!showParticles) {
      return
    }
    const particleGroup = new paper.Group()
    const particleSeeds = createGameRandom()
    let active = true

    particleGroup.sendToBack()

    const maxPoint = new paper.Point(
      canvasRef.current!.width,
      canvasRef.current!.height
    ).divide(window.devicePixelRatio)

    particlesRef.current = new Array(PARTICLES_COUNT)

    for (let i = 0; i < PARTICLES_COUNT; i++) {
      // Each particle owns its stream: tween completion order cannot change other particles.
      const random = createRandom(
        String(Math.floor(particleSeeds() * 4294967296))
      )
      const getRandomRadius = () =>
        random() * (MAX_PARTICLE_SIZE - MIN_PARTICLE_SIZE) + MIN_PARTICLE_SIZE
      const getRandomOpacity = () =>
        random() * (MAX_PARTICLE_OPACITY - MIN_PARTICLE_OPACITY) +
        MIN_PARTICLE_OPACITY
      const particle = new paper.Path.Circle({
        center: new paper.Point(random(), random()).multiply(maxPoint),
        radius: getRandomRadius(),
        opacity: getRandomOpacity(),
        parent: particleGroup,
        data: { index: i },
      }) as Particle

      const randomize = () => {
        if (!active) return
        const values = {
          radius: getRandomRadius(),
          opacity: getRandomOpacity(),
          "position.x": Math.min(
            canvasRef.current!.width / window.devicePixelRatio,
            Math.max(0, particle.position.x + random() * 200 - 100)
          ),
          "position.y": Math.min(
            canvasRef.current!.height / window.devicePixelRatio,
            Math.max(0, particle.position.y + random() * 200 - 100)
          ),
        }

        particle.data.animation = particle
          .tween(values, {
            duration: random() * 10000 + 5000,
            easing: "easeInOutQuad",
          })
          .then(randomize)
      }

      randomize()

      particlesRef.current[i] = particle
    }
    const stop = () => {
      if (!active) return
      active = false
      for (const particle of particleGroup.children)
        particle.data.animation.stop()
      particleGroup.remove()
      particlesRef.current = null
      stopParticlesRef.current = null
    }
    stopParticlesRef.current = stop
    return stop
  }, [selectedTangram, showParticles])

  useLayoutEffect(() => {
    for (const pieceGroup of piecesGroupRef.current!.children) {
      pieceGroup.children["display"].fillColor = new paper.Color(
        theme.colors.pieces[pieceGroup.data.id]
      )
      pieceGroup.children["insetBorder"].strokeColor = new paper.Color(
        theme.colors.pieces[pieceGroup.data.id]
      )
    }

    const pieceColors = Object.values(theme.colors.pieces)
    const colorRandom = createGameRandom()

    if (!showParticles) {
      return
    }

    for (const particle of particlesRef.current!) {
      particle.fillColor = new paper.Color(
        pieceColors[Math.floor(colorRandom() * pieceColors.length)]
      )
    }
  }, [theme.colors, selectedTangram, showParticles])

  useEffect(() => {
    showWelcome()
  }, [])

  return (
    <View
      css={{
        flex: "1",
        position: "relative",
        color: "dialogText",
        animation: "{durations.fade} fadeIn ease",
      }}
    >
      {selectedTangram && showBackgroundPattern === false && (
        <View
          css={{
            zIndex: -1,
            position: "absolute",
            top: "3",
            right: "3",
            cursor: "pointer",
          }}
        >
          <Card
            tangram={previewTangram ?? selectedTangram}
            selected
            hideBadge
          ></Card>
        </View>
      )}
      <CanvasView
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
            generated || currentTangramIndex < playlist!.length - 1
              ? handleNext
              : undefined
          }
          nextLoading={generated && !next && !nextFailed}
          nextFailed={generated && nextFailed}
          onApprove={
            selectedTangram.id &&
            currentUser &&
            currentUser.isAdmin &&
            !selectedTangram.approved
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
