import { ThemeContext } from "@css-system/use-css"
import paper from "paper/dist/paper-core"
import React, { useContext, useLayoutEffect, useRef } from "react"
import { Gallery } from "../components/gallery"
import { Logo } from "../components/logo"
import { View } from "../components/view"
import { SNAP_DISTANCE, DEV } from "../constants"
import { useGallery } from "../hooks/useGallery"
import { checkTangramCompleteness } from "../utils/checkTangramCompleteness"
import { createPieces } from "../utils/createGroups"
import { getScaleFactor } from "../utils/getScaleFactor"
import { getSnapVector } from "../utils/getSnapVector"
import { restrictGroupWithinCanvas } from "../utils/restrictGroupWithinCanvas"
import { scrambleGroups } from "../utils/scrambleGroups"
import { updateColisionState } from "../utils/updateColisionState"

export default () => {
  const theme = useContext(ThemeContext)
  const canvasRef = useRef()
  const groupsRef = useRef()
  const coumpoundPathRef = useRef()

  useGallery(canvasRef, coumpoundPathRef, groupsRef)

  useLayoutEffect(() => {
    const attachGroupEvents = group => {
      let anchorPoint = null
      let ghostGroup = null
      let isClick = false

      group.on("mouseenter", mdEvent => {
        document.body.style.cursor = "pointer"
      })

      group.on("mouseleave", mdEvent => {
        document.body.style.cursor = "default"
      })

      group.on("mousedown", mdEvent => {
        isClick = true

        anchorPoint = new paper.Point({
          x: mdEvent.point.x - group.position.x,
          y: mdEvent.point.y - group.position.y,
        })

        ghostGroup = group.clone({ insert: false, deep: true })

        group.bringToFront()
      })

      group.on("mouseup", () => {
        document.body.style.cursor = "pointer"

        if (isClick) {
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

          isClick = false
        }

        anchorPoint = null
        ghostGroup && ghostGroup.remove()
        ghostGroup = null

        checkTangramCompleteness(coumpoundPathRef.current, groupsRef.current)
      })

      group.on("mousedrag", mdEvent => {
        if (mdEvent.delta.length > 1) {
          isClick = false
        }

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
      })
    }

    const init = () => {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()

      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      paper.setup(canvasRef.current)

      groupsRef.current = createPieces(theme.colors)

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
        restrictGroupWithinCanvas(group, canvasRef.current)
      }

      for (const group of groupsRef.current) {
        attachGroupEvents(group)
        updateColisionState(group, groupsRef.current, theme.colors)
      }
    }

    init()
  }, [theme.colors])

  return (
    <View
      css={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <View
        css={{
          p: 2,
          position: "fixed",
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
            maxWidth: "300px",
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
      <Gallery />
    </View>
  )
}
