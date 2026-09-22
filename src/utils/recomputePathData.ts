import paper from "paper/dist/paper-core"

export const recomputePathData = (path: string) => {
  const compoundPath = paper.project.importSVG(`<path d="${path}" />`, {
    applyMatrix: true,
    insert: false,
  })

  const outline = compoundPath as import("../types").Outline
  const pathData = {
    path: (outline.exportSVG() as SVGElement).getAttribute("d")!,
    edges: outline.curves.length,
    height: Math.round(compoundPath.bounds.height),
    width: Math.round(compoundPath.bounds.width),
    length: Math.round(outline.length),
  }

  compoundPath.remove()

  if (pathData.edges < 3 || pathData.edges > 23) {
    throw new Error("Invalid path")
  }

  return pathData
}
