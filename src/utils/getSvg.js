import paper from "paper/dist/paper-core"
import { LENGTH_MAX, LENGTH_MIN } from "../constants"
// import { getOffsettedPathPoints } from "./getOffsettedPathPoints"

export const getSvg = (groups, scaleFactor) => {
  let compoundPath

  /**
   * 1st algorythm
   */
  // for (const group of groups) {
  //   const path = group.firstChild

  //   const offsettedPath = path.clone({
  //     insert: false,
  //     segments: getOffsettedPathPoints([path.segments], 1)[0],
  //   })

  //   if (!compoundPath) {
  //     compoundPath = offsettedPath
  //   } else {
  //     compoundPath = compoundPath.unite(offsettedPath, {
  //       insert: false,
  //     })
  //   }
  // }

  // const compoundPaths = compoundPath.children
  //   ? compoundPath.children
  //   : [compoundPath]

  // const offsetedCompoundPathsSegments = compoundPaths.map(
  //   ({ segments }) => segments
  // )

  // const unoffsettedCompoundPathsSegments = getOffsettedPathsSegments(
  //   offsetedCompoundPathsSegments,
  //   -1
  // )

  // compoundPaths.forEach((offsettedCompoundPath, index) => {
  //   offsettedCompoundPath.segments = unoffsettedCompoundPathsSegments[index]
  // })

  /**
   * 2nd algorythm
   */

  for (const group of groups) {
    const path = group.firstChild

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
    ((length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
  )

  return {
    width,
    height,
    percent,
    path,
  }
}
