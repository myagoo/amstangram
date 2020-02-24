import paper from "paper/dist/paper-core"
import { useCallback } from "react"
import { LENGTH_MAX, LENGTH_MIN } from "../constants"

export const useCompoundPath = groupsRef => {
  const getCompoundPath = useCallback(() => {
    let compoundPath

    for (const group of groupsRef.current) {
      const path = group.firstChild

      if (!compoundPath) {
        compoundPath = path
      } else {
        compoundPath = compoundPath.unite(path, { insert: false })
      }
    }

    compoundPath.position = new paper.Point(
      compoundPath.bounds.width / 2,
      compoundPath.bounds.height / 2
    )

    const svg = compoundPath
      .exportSVG({ asString: true })
      .replace(/fill="none"/g, "")
    const width = compoundPath.bounds.width
    const height = compoundPath.bounds.height
    const length = Math.ceil(compoundPath.length)
    const percent = Math.floor(
      ((length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
    )

    compoundPath.remove()

    return {
      svg,
      width,
      height,
      percent,
    }
  }, [groupsRef])

  return { getCompoundPath }
}
