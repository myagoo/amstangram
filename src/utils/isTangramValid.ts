export const isTangramValid = (piecesGroup: import("../types").PiecesGroup) => {
  for (const pieceGroup of piecesGroup.children) {
    if (pieceGroup.data.collisions.size > 0) {
      return false
    }
  }

  return true
}
