import paper from "paper/dist/paper-core"

export const scrambleGroup = (group, canvas) => {
  const maxPoint = new paper.Point(
    paper.project.view.bounds.width,
    paper.project.view.bounds.height
  )

  group.position = paper.Point.random().multiply(maxPoint)

  if (group.data.id === "rh") {
    const rotation = Math.round(Math.random() * 3) * 45
    group.rotation = rotation
    group.data.rotation = rotation
  } else {
    group.rotation = Math.round(Math.random() * 7) * 45
  }
}
