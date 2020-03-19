import { OVERLAPING_OPACITY } from "../constants"
import { doesPathContainsPath } from "./doesPathContainsPath"

export const updateColisionState = (group, allGroups, themeColors) => {
  for (const otherGroup of allGroups) {
    if (otherGroup === group) {
      continue
    }

    if (
      group.lastChild.intersects(otherGroup.lastChild) ||
      doesPathContainsPath(group.lastChild, otherGroup.lastChild) ||
      doesPathContainsPath(otherGroup.lastChild, group.lastChild)
    ) {
      group.data.collisions.add(otherGroup.data.id)
      otherGroup.data.collisions.add(group.data.id)
    } else {
      group.data.collisions.delete(otherGroup.data.id)
      otherGroup.data.collisions.delete(group.data.id)
    }
  }

  for (const otherGroup of allGroups) {
    if (otherGroup.data.collisions.size > 0) {
      otherGroup.firstChild.fillColor = themeColors.collision
      otherGroup.firstChild.opacity = OVERLAPING_OPACITY
    } else {
      otherGroup.firstChild.fillColor = themeColors[otherGroup.data.id]
      otherGroup.firstChild.opacity = 1
    }
  }
}
