import paper from "paper/dist/paper-core"
import { MIN_LENGTH, MAX_LENGTH } from "../constants"

export const recomputeEverything = (tangrams) => {
  if (
    !window.confirm(
      "Vous êtes sur le point de recalculer la length et le percent de tous les tangrams. Êtes vous sûr ?"
    )
  ) {
    return
  }
  const project = new paper.Project()

  const fixedTangrams = tangrams.map(
    ({ path, width, height, order, emoji, category, label, parent }) => {
      const length = project.importSVG(`<path d="${path}" />`, {
        applyMatrix: true,
        insert: false,
      }).length

      const percent = Math.floor(
        ((length - MIN_LENGTH) / (MAX_LENGTH - MIN_LENGTH)) * 100
      )

      return {
        path,
        width,
        height,
        order,
        emoji,
        category,
        label,
        filename: parent.name,
        length,
        percent,
      }
    }
  )

  project.remove()

  console.log(fixedTangrams)

  fetch(`/magic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fixedTangrams),
  })
}
