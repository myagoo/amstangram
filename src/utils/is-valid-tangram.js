export const isValidTangram = groupsRef => {
  for (const group of groupsRef.current) {
    if (group.data.collisions.size > 0) {
      return false
    }
  }

  return true
}
