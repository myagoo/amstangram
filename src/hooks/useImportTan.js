import paper from "paper/dist/paper-core"
import { useEffect } from "react"

export const useImportTan = (coumpoundPathRef, selectedTangram) => {
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
}
