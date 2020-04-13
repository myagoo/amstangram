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
    const tangramCollection = await firebase
      .firestore()
      .collection("users")
      .doc(userDoc.id)
      .collection("tangrams")
      .get()

    users[userDoc.id] = {
      data: userDoc.data(),
      collections: {
        tangrams: tangramCollection.docs.reduce((acc, tangramDoc) => {
          return { ...acc, [tangramDoc.id]: tangramDoc.data() }
        }, {}),
      },
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

  writeFileSync(
    `./export-${firebaseConfig.projectId}-${new Date()}.json`,
    JSON.stringify(
      {
        users,
        tangrams,
      },
      null,
      2
    )
  )

  process.exit(0)
}

exportFirestore()
