import paper from "paper/dist/paper-core"
import { getOffsettedPathPoints } from "./getOffsettedPathPoints"

export const isTangramComplete = (coumpoundPath: import("../types").Outline, piecesGroup: import("../types").PiecesGroup, errorMargin: number) => {
  let newCoumpoundPath = coumpoundPath

  for (const pieceGroup of piecesGroup.children) {
    if (pieceGroup.data.collisions.size > 0) {
      return
    }
    newCoumpoundPath = newCoumpoundPath.unite(
      new paper.Path({
        segments: getOffsettedPathPoints(
          pieceGroup.children["display"].segments.map(({ point }) => point),
          -errorMargin
        ),
        closed: true,
        insert: false,
      }),

      {
        insert: false,
      }
    ) as import("../types").Outline
  }

  return (
    Math.round(newCoumpoundPath.length * 1000) ===
    Math.round(coumpoundPath.length * 1000)
  )
}
