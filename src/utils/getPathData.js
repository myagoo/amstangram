import paper from "paper/dist/paper-core"
import { MAX_LENGTH, MIN_LENGTH } from "../constants"

export const getPathData = (piecesGroup, scaleFactor) => {
  let compoundPath

  for (const pieceGroup of piecesGroup.children) {
    const path = pieceGroup.children["display"]

    if (!compoundPath) {
      compoundPath = path
    } else {
      compoundPath = compoundPath.unite(path, {
        insert: false,
      })
    }
  }

  compoundPath.scale(1 / scaleFactor)

  compoundPath.position = new paper.Point(
    compoundPath.bounds.width / 2,
    compoundPath.bounds.height / 2
  )

  const path = compoundPath.exportSVG().getAttribute("d")
  const width = compoundPath.bounds.width
  const height = compoundPath.bounds.height
  const length = Math.ceil(compoundPath.length)
  const percent = Math.floor(
    ((length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100
  )

  return {
    width,
    height,
    percent,
    length,
    path,
  }
}
