import paper from "paper/dist/paper-core"
import firebase from "gatsby-plugin-firebase"

export const recomputeEverything = async (tangrams) => {
  if (
    !window.confirm(
      "Vous êtes sur le point de recalculer la length et le percent de tous les tangrams. Êtes vous sûr ?"
    )
  ) {
    return
  }

  const project = new paper.Project()

  const collection = await firebase
    .firestore()
    .collection("communityTangrams")
    .get()

  collection.forEach((doc) => {
    const tangram = doc.data()
    const compoundPath = project.importSVG(`<path d="${tangram.path}" />`, {
      applyMatrix: true,
      insert: false,
    })
    doc.ref.update({
      edges: compoundPath.curves.length,
    })
  })

  project.remove()
}
