import { ThemeContext } from "@css-system/use-css"
import paper from "paper/dist/paper-core"
import React, { useContext, useLayoutEffect, useRef } from "react"
import { Gallery } from "../components/gallery"
import { Header } from "../components/header"
import { View } from "../components/view"
import { OVERLAPING_OPACITY, SMALL_TRIANGLE_BASE } from "../constants"
import { useGallery } from "../hooks/useGallery"
import {
  createRhombus,
  createSquare,
  createTriangle,
} from "../utils/create-tans"

function contains(item1, item2) {
  return item2.segments.every(segment => item1.contains(segment.point))
}

export default () => {
  const theme = useContext(ThemeContext)
  const canvasRef = useRef()
  const groupsRef = useRef()
  const coumpoundPathRef = useRef()
  const isSimpleClickRef = useRef(false)
  // const [isSimpleClick, setIsSimpleClick] = useState(false)

  useGallery(canvasRef, coumpoundPathRef, groupsRef)

  useLayoutEffect(() => {
    function init() {
      const parentRect = canvasRef.current.parentElement.getBoundingClientRect()
      canvasRef.current.width = parentRect.width
      canvasRef.current.height = parentRect.height

      // Create an empty project and a view for the canvas:
      paper.setup(canvasRef.current)

      const minSize = Math.min(
        canvasRef.current.width,
        canvasRef.current.height
      )

      setupPieces()

      const scaleFactor = minSize / window.devicePixelRatio / 640

      const newBounds = {
        ...paper.project.view.bounds,
        width: groupsRef.current[3].bounds.width * scaleFactor,
        height: groupsRef.current[3].bounds.height * scaleFactor,
      }

      paper.project.activeLayer.fitBounds(newBounds)
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
    let ghostGroup = null
    let rotation = 0

    function attachEvents(group) {
      group.on("mousedown", mdEvent => {
        isSimpleClickRef.current = true

        anchorPoint = new paper.Point({
          x: mdEvent.point.x - group.position.x,
          y: mdEvent.point.y - group.position.y,
        })

        ghostGroup = group.clone({ insert: false, deep: true })

        group.bringToFront()
      })

      group.on("mouseup", () => {
        if (isSimpleClickRef.current === true) {
          group.rotation += 45
          rotation += 45

          if (rotation === group.data.maxDegree) {
            rotation = 0

            if (group.data.id === "rh") {
              group.scale(-1, 1)
            }
          }

          checkForIntersections(group)
          isSimpleClickRef.current = false
        }

        anchorPoint = null
        ghostGroup && ghostGroup.remove()
        ghostGroup = null
        check()
      })

      group.on("mousedrag", mdEvent => {
        isSimpleClickRef.current = false

        const newAnchorPoint = new paper.Point({
          x: mdEvent.point.x - group.position.x,
          y: mdEvent.point.y - group.position.y,
        })

        const vector = new paper.Point({
          x: newAnchorPoint.x - anchorPoint.x,
          y: newAnchorPoint.y - anchorPoint.y,
        })

        const newX = group.position.x + vector.x
        const newY = group.position.y + vector.y

        ghostGroup.position = new paper.Point({
          x: newX,
          y: newY,
        })

        let smallestDistance = 10

        let shouldSnapWithVector
        const ghostShape = ghostGroup.firstChild
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

        if (coumpoundPathRef.current) {
          const paths = coumpoundPathRef.current.children
            ? coumpoundPathRef.current.children
            : [coumpoundPathRef.current]

          for (const path of paths) {
            for (const { point: otherPoint } of path.segments) {
              for (const { point } of ghostShape.segments) {
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

          if (!shouldSnapWithVector) {
            for (const path of paths) {
              for (const { point } of ghostShape.segments) {
                const otherPoint = path.getNearestPoint(point)
                const distance = otherPoint.getDistance(point)
                if (distance < smallestDistance) {
                  smallestDistance = distance
                  shouldSnapWithVector = new paper.Point({
                    x: otherPoint.x - point.x,
                    y: otherPoint.y - point.y,
                  })
                }
              }

              for (const { point: otherPoint } of path.segments) {
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
        }

        if (shouldSnapWithVector) {
          ghostGroup.position.x += shouldSnapWithVector.x
          ghostGroup.position.y += shouldSnapWithVector.y
        }

        if (ghostGroup.bounds.x < 0) {
          ghostGroup.position.x = ghostGroup.bounds.width / 2
        }
        if (ghostGroup.bounds.y < 0) {
          ghostGroup.position.y = ghostGroup.bounds.height / 2
        }

        if (
          ghostGroup.bounds.x + ghostGroup.bounds.width >
          canvasRef.current.width
        ) {
          ghostGroup.position.x =
            canvasRef.current.width - ghostGroup.bounds.width / 2
        }

        if (
          ghostGroup.bounds.y + ghostGroup.bounds.height >
          canvasRef.current.height
        ) {
          ghostGroup.position.y =
            canvasRef.current.height - ghostGroup.bounds.height / 2
        }

        group.position = ghostGroup.position

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
        alert("👏🏻VICTORY 💪🏻")
      }
    }

    function setupPieces() {
      const smallBase = SMALL_TRIANGLE_BASE
      const mediumBase = Math.sqrt(Math.pow(smallBase, 2) * 2)
      const largeBase = Math.sqrt(Math.pow(mediumBase, 2) * 2)

      groupsRef.current = [
        createTriangle(smallBase, "st1", theme.colors["st1"]),
        createTriangle(smallBase, "st2", theme.colors["st2"]),
        createTriangle(mediumBase, "mt1", theme.colors["mt1"]),
        createTriangle(largeBase, "lt1", theme.colors["lt1"]),
        createTriangle(largeBase, "lt2", theme.colors["lt2"]),
        createSquare(mediumBase, "sq", theme.colors["sq"]),
        createRhombus(smallBase, "rh", theme.colors["rh"]),
      ]

      for (const group of groupsRef.current) {
        attachEvents(group)
        checkForIntersections(group)
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
      <Header />
      <View
        css={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          position: "relative",
        }}
      >
        <View
          css={{
            flex: "1",
            bg: "background",
            p: { _: 0, s: 2 },
            alignItems: "center",
          }}
        >
          <View
            as="canvas"
            ref={canvasRef}
            css={{
              width: "50vw",
              flex: 1,
              minWidth: { _: "100%", s: "40em" },
              background: "#fff",
            }}
            resize="true"
          />
        </View>
        <Gallery />
      </View>
    </View>
  )
}
