import paper from "paper/dist/paper-core"
import { useContext, useEffect } from "react"
import { GalleryContext } from "../contexts/gallery"
import { getSvg } from "../utils/get-svg"
import { isValidTangram } from "../utils/is-valid-tangram"

export const useGallery = (canvasRef, coumpoundPathRef, groupsRef) => {
  const { onSaveRequest, selectedTangram } = useContext(GalleryContext)

  // Import
  useEffect(() => {
    if (!selectedTangram) {
      return
    }
    const minSize = Math.min(canvasRef.current.width, canvasRef.current.height)

    const scaleFactor = minSize / window.devicePixelRatio / 640

    const item = paper.project.importSVG(selectedTangram, {
      applyMatrix: true,
    })
    item.sendToBack()
    item.position = paper.view.center
    item.fillRule = "evenodd"
    item.fillColor = "black"
    item.closed = true
    item.scale(scaleFactor)

    coumpoundPathRef.current = item

    return () => {
      item.remove()
    }
  }, [canvasRef, coumpoundPathRef, selectedTangram])

  // Save
  useEffect(() => {
    if (onSaveRequest) {
      if (isValidTangram(groupsRef)) {
        fetch(`/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ svg: getSvg(groupsRef) }),
        })
      } else {
        alert("Tangram is not valid")
      }
    }
  }, [onSaveRequest, groupsRef])
}
