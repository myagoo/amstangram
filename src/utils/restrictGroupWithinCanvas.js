export const restrictGroupWithinCanvas = (group, canvas) => {
  if (group.bounds.x < 0) {
    console.log(group.bounds.width)

    group.position.x = group.bounds.width / 2
  }
  if (group.bounds.y < 0) {
    group.position.y = group.bounds.height / 2
  }

  if (
    group.bounds.x + group.bounds.width >
    canvas.width / window.devicePixelRatio
  ) {
    group.position.x =
      canvas.width / window.devicePixelRatio - group.bounds.width / 2
  }

  if (
    group.bounds.y + group.bounds.height >
    canvas.height / window.devicePixelRatio
  ) {
    group.position.y =
      canvas.height / group.bounds.height >
      canvas.height / window.devicePixelRatio - group.bounds.height / 2
  }
}
