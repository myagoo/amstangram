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

const DEV = process.env.NODE_ENV === "development"

function getNearestPoint(p, a, b) {
  var atob = { x: b.x - a.x, y: b.y - a.y }
  var atop = { x: p.x - a.x, y: p.y - a.y }
  var len = atob.x * atob.x + atob.y * atob.y
  var dot = atop.x * atob.x + atop.y * atob.y
  var t = Math.min(1, Math.max(0, dot / len))

  dot = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)

  return new paper.Point(a.x + atob.x * t, a.y + atob.y * t)
}

function contains(item1, item2) {
  return item2.segments.every(segment => item1.contains(segment.point))
}

function getPrimarySnap(shape, otherShapes, snap) {
  for (const otherShape of otherShapes) {
    for (const { point: otherPoint } of otherShape.segments) {
      for (const { point: ghostPoint } of shape.segments) {
        const distance = ghostPoint.getDistance(otherPoint)
        if (distance < snap.distance) {
          snap.distance = distance
          snap.shape = otherShape
          snap.vector = otherPoint.subtract(ghostPoint)
        }
      }
    }
  }

  if (!snap.vector) {
    for (const otherShape of otherShapes) {
      for (const { point } of shape.segments) {
        for (const {
          point: startPoint,
          next: { point: endPoint },
        } of otherShape.segments) {
          const nearestPoint = getNearestPoint(point, startPoint, endPoint)
          const distance = nearestPoint.getDistance(point)
          if (distance < snap.distance) {
            snap.distance = distance
            snap.vector = nearestPoint.subtract(point)
            snap.shape = otherShape
            snap.segment = [startPoint, endPoint]
            snap.point = point

            if (DEV) {
              new paper.Path.Circle({
                center: nearestPoint,
                radius: 2,
                fillColor: "red",
              }).removeOn({ drag: true, move: true })
            }
          }
        }
      }

      for (const { point: otherPoint } of otherShape.segments) {
        for (const {
          point: startPoint,
          next: { point: endPoint },
        } of shape.segments) {
          const nearestPoint = getNearestPoint(otherPoint, startPoint, endPoint)
          const distance = nearestPoint.getDistance(otherPoint)
          if (distance < snap.distance) {
            snap.distance = distance
            snap.vector = otherPoint.subtract(nearestPoint)
            snap.shape = shape
            snap.segment = [startPoint, endPoint]

            if (DEV) {
              new paper.Path.Circle({
                center: nearestPoint,
                radius: 2,
                fillColor: "red",
              }).removeOn({ drag: true, move: true })
            }
          }
        }
      }
    }
  }

  return snap
}

function getSecondarySnap(shape, otherShapes, snap) {
  if (snap.segment) {
    let bestNewVectorLenth = snap.maxDistance
    let bestNewVector

    const [startPoint, endPoint] = snap.segment

    const angle1 = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x
    )
    const angle2 = Math.atan2(
      startPoint.y - endPoint.y,
      startPoint.x - endPoint.x
    )

    if (DEV) {
      new paper.Path.Line({
        from: startPoint,
        to: endPoint,
        strokeColor: "red",
      }).removeOn({ drag: true, move: true })
    }

    for (const angle of [angle1, angle2]) {
      for (const { point } of shape.segments) {
        if (point === snap.point) {
          //TODO snap.point should be an array of point when several points of the moved shape touch the snaped segment
          continue
        }
        const startPoint = point.add(snap.vector)

        const endPoint = new paper.Point(
          startPoint.x + snap.maxDistance * Math.cos(angle),
          startPoint.y + snap.maxDistance * Math.sin(angle)
        )

        const ray = new paper.Path.Line({
          from: startPoint,
          to: endPoint,
          insert: false,
        })

        if (DEV) {
          new paper.Path.Line({
            from: startPoint,
            to: endPoint,
            strokeColor: "green",
          }).removeOn({ drag: true, move: true })
        }

        for (const otherShape of otherShapes) {
          const intersections = ray.getIntersections(otherShape)

          for (const { point: intersectionPoint } of intersections) {
            if (DEV) {
              new paper.Path.Circle({
                center: intersectionPoint,
                radius: 5,
                fillColor: "blue",
              }).removeOn({ drag: true, move: true })
            }

            const newVector = intersectionPoint
              .subtract(startPoint)
              .add(snap.vector)

            if (
              newVector.length < snap.maxDistance &&
              newVector.length <= bestNewVectorLenth
            ) {
              bestNewVectorLenth = newVector.length
              bestNewVector = newVector
            }
          }
        }
      }
    }

    if (bestNewVector) {
      snap.vector = bestNewVector
    }
  }
}

function boundShape(group, canvas) {
  if (group.bounds.x < 0) {
    group.position.x = group.bounds.width / 2
  }
  if (group.bounds.y < 0) {
    group.position.y = group.bounds.height / 2
  }

  if (group.bounds.x + group.bounds.width > canvas.width) {
    group.position.x = canvas.width - group.bounds.width / 2
  }

  if (group.bounds.y + group.bounds.height > canvas.height) {
    group.position.y = canvas.height - group.bounds.height / 2
  }
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
      group.on("mouseenter", mdEvent => {
        document.body.style.cursor = "pointer"
      })

      group.on("mouseleave", mdEvent => {
        document.body.style.cursor = "default"
      })

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
        document.body.style.cursor = "pointer"

        if (isSimpleClickRef.current === true) {
          group.rotation += 45
          rotation += 45

          if (rotation === group.data.maxDegree) {
            rotation = 0

            if (group.data.id === "rh") {
              group.scale(-1, 1) // Horizontal flip
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
        document.body.style.cursor = "move"

        isSimpleClickRef.current = false

        const newAnchorPoint = mdEvent.point.subtract(group.position)

        const vector = newAnchorPoint.subtract(anchorPoint)

        ghostGroup.position = group.position.add(vector)

        const ghostShape = ghostGroup.firstChild
        const otherShapes = groupsRef.current
          .filter(otherGroup => otherGroup !== group)
          .map(({ firstChild }) => firstChild)

        let snap = {
          maxDistance: 10,
          distance: 10,
        }

        const coumpoundShapes = coumpoundPathRef.current
          ? coumpoundPathRef.current.children
            ? coumpoundPathRef.current.children
            : [coumpoundPathRef.current]
          : null

        getPrimarySnap(ghostShape, otherShapes, snap)

        if (coumpoundShapes) {
          getPrimarySnap(ghostShape, coumpoundShapes, snap)
        }

        getSecondarySnap(
          ghostShape,
          otherShapes.filter(otherShape => otherShape.shape !== snap.shape),
          snap
        )

        if (coumpoundShapes) {
          getSecondarySnap(ghostShape, coumpoundShapes, snap)
        }

        if (snap.vector) {
          ghostGroup.position.x += snap.vector.x
          ghostGroup.position.y += snap.vector.y
        }

        boundShape(ghostGroup, canvasRef.current)

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
