const firebase = require("firebase/app")
require("firebase/firestore")
require("firebase/auth")

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? require("../firebase-config.js")
    : require("../firebase-staging-config.js")

firebase.initializeApp(firebaseConfig)

if (typeof process.argv[2] !== "string") {
  throw new Error("Need email")
}

if (typeof process.argv[3] !== "string") {
  throw new Error("Need password")
}

const migrateFirestore = async () => {
  await firebase
    .auth()
    .signInWithEmailAndPassword(process.argv[2], process.argv[3])

  const usersCollection = await firebase.firestore().collection("users").get()

  for (const userDoc of usersCollection.docs) {
    const tangramCollection = await firebase
      .firestore()
      .collection("users")
      .doc(userDoc.id)
      .collection("tangrams")
      .get()

    if (tangramCollection.size) {
      for (const doc of tangramCollection.docs) {
        await doc.ref.delete()
      }
    }
  }

  const statsCollection = await firebase.firestore().collection("stats").get()

  const tangramsCompletedBy = {}

  for (const statDoc of statsCollection.docs) {
    const userId = statDoc.id
    const completedTangrams = statDoc.data()
    for (const tangramId in completedTangrams) {
      if (!tangramsCompletedBy[tangramId]) {
        tangramsCompletedBy[tangramId] = {}
      }
      tangramsCompletedBy[tangramId][userId] = {
        completed: completedTangrams[tangramId].completionTime,
      }
    }

    statDoc.ref.delete()
  }

  for (const tangramId in tangramsCompletedBy) {
    const tangramCompletedBy = tangramsCompletedBy[tangramId]
    try {
      await firebase
        .firestore()
        .collection("stats")
        .doc(tangramId)
        .set(tangramCompletedBy)
    } catch (error) {
      console.log(tangramCompletedBy)
    }
  }

  const tangramsCollection = await firebase
    .firestore()
    .collection("tangrams")
    .get()
  for (const tangramDoc of tangramsCollection.docs) {
    const tangramId = tangramDoc.id
    const tangram = tangramDoc.data()

    delete tangram.claps

    await firebase
      .firestore()
      .collection("tangrams")
      .doc(tangramId)
      .set({
        ...tangram,
      })
  }

  process.exit(0)
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason)
  // application specific logging, throwing an error, or other logic here
})

migrateFirestore()
