export const doesPathContainsPath = (pathA: paper.Path, pathB: paper.Path) => {
  return pathB.segments.every((segment) => pathA.contains(segment.point))
}
