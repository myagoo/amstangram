import { writeFileSync } from "fs"
import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"
import { pathDataToPolys } from "svg-path-to-polygons"
import {getOffsettedPathPoints} from "../src/utils/getOffsettedPathPoints.mjs"
//TODO Since we only offset simple shapes like square, rhombus and triangle, a simpler algorythm could be found
console.log(getOffsettedPathPoints)

const tangramsToIgnore = [
  "ryBENlXbPZJ0k9WeFmuW",
  "CNlZUXxJtjdV8ISUOxx0",
  "Wfbd5SzUFv5lKBB2Rjop",
  "9Zw5MTRy9wobSfoM6OjC",
  "p5A2M8oOJJD19SeS2vZe",
  "SmUkE47qaL0t8JrKHYY7",
  "vUVHcVtdwp8jqqtD9oIa",
  "0qnoqKziXDugc1V4ITcK",
  "vTBXCWFrNB6jF1bEJn2A",
  "e3PlrWxPElzn56HYwilj",
  "o91AgsGBXXq0V4FylXKU",
  "VlN246JQn1yU9zIt4XDI",
  "8F5ZRzx6aP3WacXEJfiT",
  "m0eMDYlqDAfZDUqsqavk",
  "PqlV09jHkgSO0j4j3DsV",
  "wKbP3ZDaax2liJexhwXi",
  "4OGQB4ciocHL6ZnprGL9",
  "btjaAOTvkabAk9tGcRWz",
  "R2prKfX21te4hh7aREJc",
  "O9OmbW05d2k2rD4i9hjS",
  "F7VIsgQwV6GA8JbVIwOm",
  "EuOFZWJvt8NT7Q9WL6NR",
  "6OSYbX8tt6Dn2AlBSdb8",
  "JeRD1TI4ubSajKwrnPdx",
  "wTckDJFK08aXygQrIGyY",
  "UVG4uT4QouVyg1fg4u63",
  "X69fzw5Mc3R1qINeTXGC",
  "apKoHjFlebyTZf9uKlEx",
  "pUDY6TFoW3gaXqIgBWbe",
  "XWmonGkyuPX8qzuelQpE",
  "8anWJ62tVawUDfjgfkpz",
  "PPZ4it3LsH3AtsrIMd4f",
  "rf9YMzwaPlDUWHDoRleU",
  "8zqrEiwFSKnF2lT3Xesv",
  "RyH48C5LZXVmAkblFqj9",
  "aCJS6kTxG01mIKMmpadW",
  "vKcd6zcFVj2ftAFvgHqH",
  "G6VMIebn7OVIy5w2FVMQ",
  "7jAYg09ERZCkKr8PEiKB",
  "pXHyoKF5buykcURuJUa1",
  "SgS1JCmGmXhCOWnnDqDT",
  "LsmX6tC8gfCew8nmOMie",
  "6fzMWxN7gcvlZypAVxpG",
  "xJZ7Gtme45ULRqOIz1Cf",
  "O2DiRcQog9NcOUC8kPBA",
  "LceNvyfHZKHBjorQZLYx",
  "3hUy586o29rDRx76WgvI",
  "Tjp48QLMkbCkDAJVR54h",
  "qida0GDx730lClWnSF0J",
  "cce6Z0eewC2T8EVg8KVX",
  "IXWxahygo2NaVO7UY1kE",
]

firebase.initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
})

const exportFirestore = async () => {
  const tangrams = {}

  const tangramsCollection = await firebase
    .firestore()
    .collection("tangrams")
    .get()
  for (const tangramDoc of tangramsCollection.docs) {
    const { path, uid, length, approved, category, ...rest } = tangramDoc.data()

    if (!approved || tangramsToIgnore.includes(tangramDoc.id)) {
      continue
    }

    if (!tangrams[category]) {
      tangrams[category] = []
    }

    try {
      const pattern = pathDataToPolys(path).map((shape) =>
        getOffsettedPathPoints(shape, 1)
      )

      tangrams[category].push({
        ...rest,
        id: tangramDoc.id,
        path,
        pattern,
      })
    } catch (error) {
      console.error(error)
      console.error(tangramDoc.id)
      console.error(path)
    }
  }

  writeFileSync(
    `./export-${
      process.env.VITE_FIREBASE_PROJECT_ID
    }-${new Date().toISOString()}.json`,
    JSON.stringify(tangrams, null, 2)
  )

  process.exit(0)
}

exportFirestore()
