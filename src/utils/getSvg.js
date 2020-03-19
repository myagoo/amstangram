import paper from "paper/dist/paper-core"
import { LENGTH_MAX, LENGTH_MIN } from "../constants"
import { getOffsettedPoints } from "./getOffsettedPoints"

export const getSvg = (groups, scaleFactor) => {
  let offsettedCompoundPath

  for (const group of groups) {
    const path = group.firstChild

    const offsettedPath = path.clone({
      insert: false,
      segments: getOffsettedPoints(path.segments, 0.5),
    })

    if (!offsettedCompoundPath) {
      offsettedCompoundPath = offsettedPath
    } else {
      offsettedCompoundPath = offsettedCompoundPath.unite(offsettedPath, {
        insert: false,
      })
    }
  }

  const offsettedCoumpoundShapes = offsettedCompoundPath.children
    ? offsettedCompoundPath.children
    : [offsettedCompoundPath]

  let coumpoundPath

  for (const offsettedCoumpoundShape of offsettedCoumpoundShapes) {
    const coumpoundShape = offsettedCoumpoundShape.clone({
      insert: false,
      segments: getOffsettedPoints(offsettedCoumpoundShape.segments, -0.5),
    })

    if (!coumpoundPath) {
      coumpoundPath = coumpoundShape
    } else {
      coumpoundPath = coumpoundPath.unite(coumpoundShape, {
        insert: false,
      })
    }
  }

  coumpoundPath.scale(1 / scaleFactor)

  coumpoundPath.position = new paper.Point(
    coumpoundPath.bounds.width / 2,
    coumpoundPath.bounds.height / 2
  )

  const svg = coumpoundPath
    .exportSVG({ asString: true })
    .replace(/fill-?[^']*?="[^']*?"/g, "")
    .replace(/stroke-?[^']*?="[^']*?"/g, "")
  const width = coumpoundPath.bounds.width
  const height = coumpoundPath.bounds.height
  const length = Math.ceil(coumpoundPath.length)
  const percent = Math.floor(
    ((length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
  )

  //compoundPath.remove()

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" data-percent="${percent}">${svg}</svg>`
}
