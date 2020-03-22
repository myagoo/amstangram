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
  console.log(newCoumpoundPath.length, coumpoundPath.length)
  return newCoumpoundPath.length === coumpoundPath.length
}
