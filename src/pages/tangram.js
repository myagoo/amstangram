import paper from "paper/dist/paper-core"
import React, { useContext, useLayoutEffect, useRef } from "react"
import { View } from "../components/view"
import { OVERLAPING_OPACITY, SMALL_TRIANGLE_BASE } from "../constants"
import { useGallery } from "../hooks/useGallery"
import { useShapes } from "../hooks/useShapes"
import { ThemeContext } from "../Theme"

function contains(item1, item2) {
  return item2.segments.every(segment => item1.contains(segment.point))
}

export const Tangram = () => {
  const theme = useContext(ThemeContext)
  const canvasRef = useRef()
  const groupsRef = useRef()
  const coumpoundPathRef = useRef()
  const {
    createRhombusGroup,
    createSquareGroup,
    createTriangleGroup,
  } = useShapes()
  useGallery(coumpoundPathRef, groupsRef)

  useLayoutEffect(() => {
    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()
      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      // Create an empty project and a view for the canvas:
      paper.setup(canvasRef.current)
      setupPieces()
    }

    const checkForIntersections = group => {
      for (const group2 of groupsRef.current) {
        if (group2 === group) {
          continue
        }

        if (
          group.lastChild.intersects(group2.lastChild) ||
          contains(group.lastChild, group2.lastChild) ||
          contains(group2.lastChild, group.lastChild)
        ) {
          group.data.collisions.add(group2.data.id)
          group2.data.collisions.add(group.data.id)
        } else {
          group.data.collisions.delete(group2.data.id)
          group2.data.collisions.delete(group.data.id)
        }
      }

      for (const otherGroup of groupsRef.current) {
        if (otherGroup === group) {
          continue
        }
        if (otherGroup.data.collisions.size > 0) {
          otherGroup.firstChild.fillColor = theme.colors.collision
          otherGroup.firstChild.opacity = OVERLAPING_OPACITY
        } else {
          otherGroup.firstChild.fillColor = theme.colors[otherGroup.data.id]
          otherGroup.firstChild.opacity = 1
        }
      }
    }

    let anchorPoint = null
    let snappedToPoint = null
    let ghostShape = null
    let point = null

    function attachEvents(group) {
      group.on("mousedown", mdEvent => {
        anchorPoint = new paper.Point({
          x: mdEvent.point.x - group.firstChild.position.x,
          y: mdEvent.point.y - group.firstChild.position.y,
        })

        point = new paper.Path.Circle({
          center: mdEvent.point,
          radius: 3,
          fillColor: "red",
        })

        ghostShape = new paper.Path({
          position: group.firstChild.position,
          segments: group.firstChild.segments,
          closed: true,
          strokeColor: "black",
          strokeWidth: 2,
          applyMatrix: true,
        })

        group.bringToFront()
      })

      group.on("mouseup", () => {
        anchorPoint = null
        ghostShape.remove()
        ghostShape = null
        point.remove()
        point = null
        check()
      })

      group.on("mousedrag", mdEvent => {
        const newAnchorPoint = new paper.Point({
          x: mdEvent.point.x - group.position.x,
          y: mdEvent.point.y - group.position.y,
        })
        console.log(
          group.firstChild.position,
          group.localToGlobal(group.firstChild.position)
        )

        const vector = {
          x: newAnchorPoint.x - anchorPoint.x,
          y: newAnchorPoint.y - anchorPoint.y,
        }

        // let newX = group.position.x + mdEvent.delta.x
        // let newY = group.position.y + mdEvent.delta.y

        if (snappedToPoint) {
          if (newAnchorPoint.getDistance(anchorPoint) < 20) {
            return
          } else {
            snappedToPoint = false
            group.position.x = ghostShape.position.x
            group.position.y = ghostShape.position.y
            return
          }
        }

        ghostShape.position = {
          x: group.firstChild.position.x + vector.x,
          y: group.firstChild.position.y + vector.y,
        }

        point.position = newAnchorPoint
        // console.log(vector, group.position, group.firstChild.position)

        // const isOutsideCanvas =
        //   newX - group.bounds.width / 2 <= 0 ||
        //   newY - group.bounds.height / 2 <= 0 ||
        //   newX + group.bounds.width / 2 > canvasRef.current.offsetWidth ||
        //   newY + group.bounds.height / 2 > canvasRef.current.offsetHeight

        // if (isOutsideCanvas) {
        //   return
        // }

        let smallestDistance = 10
        let shouldSnapWithVector
        for (const otherGroup of groupsRef.current) {
          if (otherGroup === group) {
            continue
          }
          const otherShape = otherGroup.firstChild
          for (const { point: otherPoint } of otherShape.segments) {
            for (const { point } of ghostShape.segments) {
              const distance = point.getDistance(otherPoint)
              if (distance < smallestDistance) {
                smallestDistance = distance
                shouldSnapWithVector = new paper.Point({
                  x: otherPoint.x - point.x,
                  y: otherPoint.y - point.y,
                })
                snappedToPoint = true
              }
            }
          }
        }

        if (!shouldSnapWithVector) {
          for (const otherGroup of groupsRef.current) {
            if (otherGroup === group) {
              continue
            }
            const otherShape = otherGroup.firstChild

            for (const { point } of ghostShape.segments) {
              const otherPoint = otherShape.getNearestPoint(point)
              const distance = otherPoint.getDistance(point)
              if (distance < smallestDistance) {
                smallestDistance = distance
                shouldSnapWithVector = new paper.Point({
                  x: otherPoint.x - point.x,
                  y: otherPoint.y - point.y,
                })
              }
            }

            for (const { point: otherPoint } of otherShape.segments) {
              const point = ghostShape.getNearestPoint(otherPoint)
              const distance = point.getDistance(otherPoint)
              if (distance < smallestDistance) {
                smallestDistance = distance
                shouldSnapWithVector = new paper.Point({
                  x: otherPoint.x - point.x,
                  y: otherPoint.y - point.y,
                })
              }
            }
          }
        }

        if (shouldSnapWithVector) {
          ghostShape.position.x += shouldSnapWithVector.x
          ghostShape.position.y += shouldSnapWithVector.y
        }

        group.position.x = ghostShape.position.x
        group.position.y = ghostShape.position.y

        checkForIntersections(group)
      })

      group.on("doubleclick", mdEvent => {
        group.rotation += 45
        checkForIntersections(group)
      })
    }

    function check() {
      if (!coumpoundPathRef.current) {
        return
      }
      let newCoumpoundPath = coumpoundPathRef.current

      for (const group of groupsRef.current) {
        if (group.data.collisions.size > 0) {
          return
        }
        newCoumpoundPath = newCoumpoundPath.unite(group.lastChild, {
          insert: false,
        })
      }
      if (newCoumpoundPath.length === coumpoundPathRef.current.length) {
        alert("YOU WIN MOTHERFUCKER")
      }
    }

    function setupPieces() {
      const smallBase = SMALL_TRIANGLE_BASE
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)

      groupsRef.current = [
        createTriangleGroup(smallBase, "st1"),
        createTriangleGroup(smallBase, "st2"),
        createTriangleGroup(mediumBase, "mt1"),
        // createTriangleGroup(largeBase, "lt1"),
        // createTriangleGroup(largeBase, "lt2"),
        // createSquareGroup(mediumBase, "sq"),
        // createRhombusGroup(smallBase, "rh"),
      ]

      for (const group of groupsRef.current) {
        attachEvents(group)
        checkForIntersections(group)
      }
    }

    init()
  }, [createRhombusGroup, createSquareGroup, createTriangleGroup, theme.colors])

  return (
    <View
      css={{
        flex: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bg: "background",
      }}
    >
      <View css={{ width: "50vw", height: "80%", background: "#fff" }}>
        <View as="canvas" ref={canvasRef} css={{ flex: "1" }} />
      </View>
    </View>
  )
}
