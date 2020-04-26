import paper from "paper/dist/paper-core"

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
  const edges = compoundPath.curves.length
  const width = Math.round(compoundPath.bounds.width)
  const height = Math.round(compoundPath.bounds.height)
  const length = Math.round(compoundPath.length)

  compoundPath.remove()

  return {
    width,
    height,
    length,
    path,
    edges,
  }
}
