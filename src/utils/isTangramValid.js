export const isTangramValid = groups => {
  for (const group of groups) {
    if (group.data.collisions.size > 0) {
      return false
    }
  }

  return true
}
