import firebase from "../utils/firebase"
import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react"
import { UserContext } from "./user"

/* Parse jsonString of an array of tans into a tangram */
var parseTanArray = function (jsonString) {
  var tangram = JSON.parse(jsonString)
  var tans = []
  for (var index = 0; index < 7; index++) {
    var currentTan = tangram[index]
    var anchor = new Point(
      new IntAdjoinSqrt2(
        currentTan.anchor.x.coeffInt,
        currentTan.anchor.x.coeffSqrt
      ),
      new IntAdjoinSqrt2(
        currentTan.anchor.y.coeffInt,
        currentTan.anchor.y.coeffSqrt
      )
    )
    tans.push(new Tan(currentTan.tanType, anchor, currentTan.orientation))
  }
  return new Tangram(tans)
}

export const TangramsContext = createContext([])

export const TangramsProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext)
  const [allTangrams, setAllTangrams] = useState(null)

  useEffect(() => {
    const worker = new Worker(new URL("../Code/generator.js", import.meta.url))

    worker.onmessage = function (event) {
      var message = event.data
      if (typeof message === "string") {
        if (message === "Worker started!") {
          generating = true
          console.log("Worker said: ", message)
        } else if (message === "Generating done!") {
          
          setAllTangrams(
            generated.map((tangram, index) => {
              tangram.positionCentered()
              return {
                id: index,
                approved: true,
                category: "geometric",
                emoji: "👴",
                length: tangram.evaluation.perimeter,
                edges: tangram.evaluation.outlineVertices,
                height: tangram.evaluation.rangeY,
                width: tangram.evaluation.rangeX,
                path: tangram.toSVGOutline(),
              }
            })
          )
        } else if (message.startsWith("console")) {
          console.log("Log from worker", message)
        } else {
          generating = false
          generated.push(parseTanArray(message))
        }
      } else {
        console.log("Worker said: ", "Generated!")
      }
    }

    worker.postMessage(1000)

    return () => worker.terminate()
  }, [])

  const contextValue = useMemo(() => {
    if (!allTangrams) {
      return {
        initialized: false,
        approvedTangrams: null,
        pendingTangrams: null,
        approvedTangramsByCategory: null,
      }
    }

    const newApprovedTangrams = []
    const newPendingTangrams = []

    for (const tangram of allTangrams) {
      if (tangram.approved) {
        newApprovedTangrams.push(tangram)
      } else if (
        currentUser &&
        (currentUser.isAdmin || tangram.uid === currentUser.uid)
      ) {
        newPendingTangrams.push(tangram)
      }
    }

    return {
      initialized: true,
      approvedTangrams: newApprovedTangrams,
      pendingTangrams: newPendingTangrams,
    }
  }, [currentUser, allTangrams])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
