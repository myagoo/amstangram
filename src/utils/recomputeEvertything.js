import paper from "paper/dist/paper-core"
import firebase from "gatsby-plugin-firebase"
import { getRandomEmoji } from "./getRandomEmoji"

export const recomputeEverything = async (tangrams) => {
  if (
    !window.confirm(
      "Vous êtes sur le point de recalculer la length et le percent de tous les tangrams. Êtes vous sûr ?"
    )
  ) {
    return
  }

  const project = new paper.Project()

  const collection = await firebase.firestore().collection("tangrams").get()

  collection.forEach((doc) => {
    const tangram = doc.data()
    const compoundPath = project.importSVG(`<path d="${tangram.path}" />`, {
      applyMatrix: true,
      insert: false,
    })
    delete tangram.percent
    doc.ref.set({
      ...tangram,
      emoji: tangram.emoji || getRandomEmoji(),
      height: Math.round(tangram.height * 100) / 100,
      width: Math.round(tangram.width * 100) / 100,
      length: Math.round(compoundPath.length * 100) / 100,
    })
  })

  project.remove()
}
