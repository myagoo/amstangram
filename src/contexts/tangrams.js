import firebase from "gatsby-plugin-firebase"
import React, { createContext, useEffect, useState } from "react"

export const TangramsContext = createContext([])

export const TangramsProvider = ({ children }) => {
  const [tangrams, setTangrams] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("tangrams")
      .onSnapshot((collectionSnapshot) => {
        const newTangrams = []

        for (const doc of collectionSnapshot.docs) {
          const id = doc.id
          const tangram = doc.data()
          newTangrams.push({
            id,
            ...tangram,
          })
        }

        setTangrams(newTangrams)
      })

    return unsubscribe
  }, [])

  return (
    <TangramsContext.Provider value={tangrams}>
      {children}
    </TangramsContext.Provider>
  )
}
