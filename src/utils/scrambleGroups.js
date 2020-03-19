import paper from "paper/dist/paper-core"

export const scrambleGroups = (groups, canvas) => {
  const maxPoint = new paper.Point(canvas.width, canvas.height).divide(
    window.devicePixelRatio
  )

  for (const group of groups) {
    group.position = paper.Point.random().multiply(maxPoint)

    if (group.data.id === "rh") {
      const rotation = Math.round(Math.random() * 3) * 45
      group.rotation = rotation
      group.data.rotation = rotation
    } else {
      group.rotation = Math.round(Math.random() * 7) * 45
    }
  }
}
