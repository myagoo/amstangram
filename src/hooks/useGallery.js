import paper from "paper/dist/paper-core"
import { useContext, useEffect } from "react"
import { GalleryContext } from "../contexts/gallery"
import { getSvg } from "../utils/getSvg"
import { isTangramValid } from "../utils/isTangramValid"
import { getScaleFactor } from "../utils/getScaleFactor"
import { DEV } from "../constants"

export const useGallery = (canvasRef, coumpoundPathRef, groupsRef) => {
  const { saveRequestId, selectedTangram } = useContext(GalleryContext)

  // Import
  useEffect(() => {
    if (!selectedTangram) {
      return
    }

    const coumpoundPath = paper.project.importSVG(selectedTangram, {
      applyMatrix: true,
    })

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

    return () => {
      coumpoundPath.remove()
    }
  }, [canvasRef, coumpoundPathRef, selectedTangram])

  // Save
  useEffect(() => {
    if (saveRequestId) {
      if (isTangramValid(groupsRef.current)) {
        const scaleFactor = getScaleFactor(canvasRef.current)

        fetch(`/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svg: getSvg(groupsRef.current, scaleFactor) }),
        })
      } else {
        alert("Tangram is not valid")
      }
    }
  }, [canvasRef, saveRequestId, groupsRef])
}
