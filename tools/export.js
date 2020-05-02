const { writeFileSync } = require("fs")
const firebase = require("firebase/app")
require("firebase/firestore")

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? require("../firebase-config.js")
    : require("../firebase-staging-config.js")

firebase.initializeApp(firebaseConfig)

const exportFirestore = async () => {
  const users = {}

  const usersCollection = await firebase.firestore().collection("users").get()

  for (const userDoc of usersCollection.docs) {
    users[userDoc.id] = {
      data: userDoc.data(),
      collections: {},
    }
  }

  const tangrams = {}

  const tangramsCollection = await firebase
    .firestore()
    .collection("tangrams")
    .get()
  for (const tangramDoc of tangramsCollection.docs) {
    tangrams[tangramDoc.id] = {
      data: tangramDoc.data(),
      collections: {},
    }
  }

  const stats = {}

  const statsCollection = await firebase.firestore().collection("stats").get()
  for (const statsDoc of statsCollection.docs) {
    stats[statsDoc.id] = {
      data: statsDoc.data(),
      collections: {},
    }
  }

  writeFileSync(
    `./export-${firebaseConfig.projectId}-${new Date().toISOString()}.json`,
    JSON.stringify(
      {
        users,
        tangrams,
        stats,
      },
      null,
      2
    )
  )

  process.exit(0)
}

exportFirestore()
