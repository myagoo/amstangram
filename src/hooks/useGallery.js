import paper from "paper/dist/paper-core"
import { useContext, useEffect } from "react"
import { GalleryContext } from "../components/gallery-provider"
import { useCompoundPath } from "./useGetCompoundPath"

export const useGallery = (coumpoundPathRef, groupsRef) => {
  const { onSaveRequest, selectedTangram } = useContext(GalleryContext)
  const { getCompoundPath } = useCompoundPath(groupsRef)

  // Import
  useEffect(() => {
    if (!selectedTangram) {
      return
    }

    const item = paper.project.importSVG(selectedTangram, {})
    item.sendToBack()
    item.position = paper.view.center
    item.fillRule = "evenodd"
    item.fillColor = "black"
    item.closed = true

    coumpoundPathRef.current = item

    return () => {
      item.remove()
    }
  }, [coumpoundPathRef, selectedTangram])

  // Save
  useEffect(() => {
    if (onSaveRequest) {
      onSaveRequest(getCompoundPath())
    }
  }, [onSaveRequest, getCompoundPath])
}
