export const isTangramValid = piecesGroup => {
  for (const pieceGroup of piecesGroup.children) {
    if (pieceGroup.data.collisions.size > 0) {
      return false
    }
  }

  return true
}
