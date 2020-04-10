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

  const collection = await firebase.firestore().collection("baseTangrams").get()

  collection.forEach((doc) => {
    const tangram = doc.data()

    firebase.firestore().collection("tangrams").doc(doc.id).set(tangram)
  })
}
