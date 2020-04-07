import { OVERLAPING_OPACITY } from "../constants"
import { doesPathContainsPath } from "./doesPathContainsPath"

export const updateColisionState = (pieceGroup, piecesGroup) => {
  for (const otherPieceGroup of piecesGroup.children) {
    if (otherPieceGroup === pieceGroup) {
      continue
    }

    const pieceCollisionShape = pieceGroup.children["collision"]
    const otherPieceCollisionShape = otherPieceGroup.children["collision"]
    if (
      pieceCollisionShape.intersects(otherPieceCollisionShape) ||
      doesPathContainsPath(pieceCollisionShape, otherPieceCollisionShape) ||
      doesPathContainsPath(otherPieceCollisionShape, pieceCollisionShape)
    ) {
      pieceGroup.data.collisions.add(otherPieceGroup.data.id)
      otherPieceGroup.data.collisions.add(pieceGroup.data.id)
    } else {
      pieceGroup.data.collisions.delete(otherPieceGroup.data.id)
      otherPieceGroup.data.collisions.delete(pieceGroup.data.id)
    }
  }

  let isTangramValid = true

  for (const otherPieceGroup of piecesGroup.children) {
    if (otherPieceGroup.data.collisions.size > 0) {
      isTangramValid = false
      otherPieceGroup.children["display"].opacity = OVERLAPING_OPACITY
    } else {
      otherPieceGroup.children["display"].opacity = 1
    }
  }

  return isTangramValid
}
