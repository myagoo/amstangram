import paper from "paper/dist/paper-core"
import { getScaleFactor } from "./getScaleFactor"

export const scrambleGroups = (groups, canvas) => {
  const scaleFactor = getScaleFactor(canvas)

  const maxPoint = new paper.Point(canvas.width, canvas.height).multiply(
    scaleFactor
  )

  for (const group of groups) {
    const randomPoint = paper.Point.random().multiply(maxPoint)

    group.position = randomPoint

    if (group.data.id === "rh") {
      const rotation = Math.round(Math.random() * 3) * 45
      group.rotation = rotation
      group.data.rotation = rotation
    } else {
      group.rotation = Math.round(Math.random() * 7) * 45
    }
  }
}
