export const isTangramComplete = (coumpoundPath, piecesGroup) => {
  if (!coumpoundPath) {
    return
  }

  let newCoumpoundPath = coumpoundPath

  for (const pieceGroup of piecesGroup.children) {
    if (pieceGroup.data.collisions.size > 0) {
      return
    }
    newCoumpoundPath = newCoumpoundPath.unite(pieceGroup.lastChild, {
      insert: false,
    })
  }

  return (
    Math.round(newCoumpoundPath.length * 1000) ===
    Math.round(coumpoundPath.length * 1000)
  )
}
