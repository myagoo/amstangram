import { OVERLAPING_OPACITY } from "../constants"
import { doesPathContainsPath } from "./doesPathContainsPath"

export const updateColisionState = (pieceGroup, piecesGroup) => {
  for (const otherPieceGroup of piecesGroup.children) {
    if (otherPieceGroup === pieceGroup) {
      continue
    }

    if (
      pieceGroup.lastChild.intersects(otherPieceGroup.lastChild) ||
      doesPathContainsPath(pieceGroup.lastChild, otherPieceGroup.lastChild) ||
      doesPathContainsPath(otherPieceGroup.lastChild, pieceGroup.lastChild)
    ) {
      pieceGroup.data.collisions.add(otherPieceGroup.data.id)
      otherPieceGroup.data.collisions.add(pieceGroup.data.id)
    } else {
      pieceGroup.data.collisions.delete(otherPieceGroup.data.id)
      otherPieceGroup.data.collisions.delete(pieceGroup.data.id)
    }
  }

  for (const otherPieceGroup of piecesGroup.children) {
    if (otherPieceGroup.data.collisions.size > 0) {
      otherPieceGroup.firstChild.opacity = OVERLAPING_OPACITY
    } else {
      otherPieceGroup.firstChild.opacity = 1
    }
  }
}
