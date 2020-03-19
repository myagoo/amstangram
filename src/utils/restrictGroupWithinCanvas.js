import paper from "paper/dist/paper-core"

export const restrictGroupWithinCanvas = (group, canvas) => {
  const correctionVector = group.pivot
    ? group.pivot.subtract(group.bounds.center)
    : new paper.Point()

  if (group.bounds.x < 0) {
    group.position.x = group.bounds.width / 2 + correctionVector.x
  }
  if (group.bounds.y < 0) {
    group.position.y = group.bounds.height / 2 + correctionVector.y
  }

  if (
    group.bounds.x + group.bounds.width >
    canvas.width / window.devicePixelRatio
  ) {
    group.position.x =
      canvas.width / window.devicePixelRatio -
      group.bounds.width / 2 +
      correctionVector.x
  }

  if (
    group.bounds.y + group.bounds.height >
    canvas.height / window.devicePixelRatio
  ) {
    group.position.y =
      canvas.height / window.devicePixelRatio -
      group.bounds.height / 2 +
      correctionVector.y
  }
}
