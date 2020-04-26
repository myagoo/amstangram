const { readFileSync } = require("fs")
const firebase = require("firebase/app")
require("firebase/firestore")
require("firebase/auth")

const DIGITS = [
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "0️⃣",
].reverse()
const LETTERS = [
  "🄰",
  "🄱",
  "🄲",
  "🄳",
  "🄴",
  "🄵",
  "🄶",
  "🄷",
  "🄸",
  "🄹",
  "🄺",
  "🄻",
  "🄼",
  "🄽",
  "🄾",
  "🄿",
  "🅀",
  "🅁",
  "🅂",
  "🅃",
  "🅄",
  "🅅",
  "🅆",
  "🅇",
  "🅈",
  "🅉",
]

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? require("../firebase-config.js")
    : require("../firebase-staging-config.js")

firebase.initializeApp(firebaseConfig)

if (typeof process.argv[2] !== "string") {
  throw new Error("Need path")
}

if (typeof process.argv[3] !== "string") {
  throw new Error("Need email")
}

if (typeof process.argv[4] !== "string") {
  throw new Error("Need password")
}

const importFirestore = async () => {
  const data = JSON.parse(readFileSync(process.argv[2]))

  await firebase
    .auth()
    .signInWithEmailAndPassword(process.argv[3], process.argv[4])

  for (const collectionKey in data) {
    const collection = await firebase
      .firestore()
      .collection(collectionKey)
      .get()
    for (const document of collection.docs) {
      await firebase
        .firestore()
        .collection(collectionKey)
        .doc(document.id)
        .delete()
    }
    for (const documentId in data[collectionKey]) {
      const documentData = data[collectionKey][documentId].data

      // if (collectionKey === "tangrams") {
      //   if (documentData.category === "letters") {
      //     console.log(documentData.order)
      //     documentData.emoji = LETTERS[documentData.order - 1] || "🄰"
      //     delete documentData.order
      //     if (!documentData.uid) {
      //       documentData.uid = "gKVKolTkV1TEJKAv0HwA5qyycSg1"
      //       documentData.approved = true
      //     }
      //   } else if (documentData.category === "digits") {
      //     console.log(documentData.order)
      //     documentData.emoji = DIGITS[Math.abs(documentData.order) - 1] || "0️⃣"
      //     delete documentData.order
      //     if (!documentData.uid) {
      //       documentData.uid = "gKVKolTkV1TEJKAv0HwA5qyycSg1"
      //       documentData.approved = true
      //     }
      //   } else {
      //     delete documentData.order
      //     if (!documentData.uid) {
      //       documentData.uid = "5ZiQ173OfaUkHLvcxMPS7FQAzmu2"
      //       documentData.approved = true
      //     }
      //   }
      // }

      try {
        await firebase
          .firestore()
          .collection(collectionKey)
          .doc(documentId)
          .set(documentData)
      } catch (error) {
        console.error(documentData)
        process.exit(1)
      }

      const subCollections = data[collectionKey][documentId].collections

      for (const subCollectionId in subCollections) {
        if (collectionKey === "users" && subCollectionId === "tangrams") {
          const subCollection = subCollections[subCollectionId]
          for (const subDocumentId in subCollection) {
            const subDocument = subCollection[subDocumentId]
            await firebase
              .firestore()
              .collection("stats")
              .doc(documentId)
              .set(
                {
                  [subDocumentId]: subDocument,
                },
                { merge: true }
              )
          }
        }

        const subCollection = subCollections[subCollectionId]
        for (const subDocumentId in subCollection) {
          const subDocument = subCollection[subDocumentId]
          await firebase
            .firestore()
            .collection(collectionKey)
            .doc(documentId)
            .collection(subCollectionId)
            .doc(subDocumentId)
            .set(subDocument)
        }
      }
    }
  }

  process.exit(0)
}

process.on("unhandledRejection", (reason, p) => {
  console.log("Unhandled Rejection at: Promise", p, "reason:", reason)
  // application specific logging, throwing an error, or other logic here
})

importFirestore()
