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
      await firebase
        .firestore()
        .collection("stats")
        .doc(userDoc.id)
        .set(
          tangramCollection.docs.reduce((acc, tangramDoc) => {
            return { ...acc, [tangramDoc.id]: tangramDoc.data() }
          }, {})
        )
    }
  }

  process.exit(0)
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason)
  // application specific logging, throwing an error, or other logic here
})

migrateFirestore()
