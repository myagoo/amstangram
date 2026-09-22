import paper from "paper/dist/paper-core"
import { SCRAMBLE_PADDING } from "../constants"
import { createGameRandom } from "./createRandom"

const scrambleRandom = createGameRandom()

export const scrambleGroup = (group: import("../types").TanGroup, random = scrambleRandom) => {
  const maxPoint = new paper.Point(
    paper.project.view.bounds.width,
    paper.project.view.bounds.height
  ).subtract(SCRAMBLE_PADDING * 2)

  group.position = new paper.Point(random(), random())
    .multiply(maxPoint)
    .add(SCRAMBLE_PADDING)

  if (group.data.id === "rh") {
    const rotation = Math.round(random() * 3) * 45
    group.rotation = rotation
    group.data.rotation = rotation
  } else {
    group.rotation = Math.round(random() * 7) * 45
  }
}
