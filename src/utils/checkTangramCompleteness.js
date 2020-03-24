export const isTangramComplete = (coumpoundPath, groups) => {
  if (!coumpoundPath) {
    return
  }

  let newCoumpoundPath = coumpoundPath

  for (const group of groups) {
    if (group.data.collisions.size > 0) {
      return
    }
    newCoumpoundPath = newCoumpoundPath.unite(group.lastChild, {
      insert: false,
    })
  }
  return (
    Math.round(newCoumpoundPath.length * 1000) ===
    Math.round(coumpoundPath.length * 1000)
  )
}