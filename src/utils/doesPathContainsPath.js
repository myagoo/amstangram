export const doesPathContainsPath = (pathA, pathB) => {
  return pathB.segments.every(segment => pathA.contains(segment.point))
}
