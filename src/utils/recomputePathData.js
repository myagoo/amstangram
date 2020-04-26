import paper from "paper/dist/paper-core"

export const recomputePathData = (path) => {
  const compoundPath = paper.project.importSVG(`<path d="${path}" />`, {
    applyMatrix: true,
    insert: false,
  })

  const pathData = {
    path: compoundPath.exportSVG().getAttribute("d"),
    edges: compoundPath.curves.length,
    height: Math.round(compoundPath.bounds.height),
    width: Math.round(compoundPath.bounds.width),
    length: Math.round(compoundPath.length),
  }

  compoundPath.remove()

  if (pathData.edges < 3 || pathData.edges > 23) {
    throw new Error("Invalid path")
  }

  return pathData
}
