import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react"
import { UserContext } from "./user"
import {
  sortDigitsTangrams,
  sortLettersTangrams,
  sortTangrams,
} from "../utils/sortTangrams"

export const TangramsContext = createContext([])

export const TangramsProvider = ({ children }) => {
  const { currentUser } = useContext(UserContext)
  const [allTangrams, setAllTangrams] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("tangrams")
      .onSnapshot((collectionSnapshot) => {
        const newAllTangrams = []
        for (const doc of collectionSnapshot.docs) {
          const id = doc.id
          const { ...tangram } = doc.data()

          newAllTangrams.push({
            id,
            ...tangram,
          })
        }
        setAllTangrams(newAllTangrams)
      })

    return unsubscribe
  }, [])

  const contextValue = useMemo(() => {
    if (!allTangrams) {
      return {
        initialized: false,
        approvedTangrams: null,
        pendingTangrams: null,
        approvedTangramsByCategory: null,
      }
    }

    const newApprovedTangrams = []
    const newPendingTangrams = []

    for (const tangram of allTangrams) {
      if (tangram.approved) {
        newApprovedTangrams.push(tangram)
      } else if (
        currentUser &&
        (currentUser.isAdmin || tangram.uid === currentUser.uid)
      ) {
        newPendingTangrams.push(tangram)
      }
    }

    return {
      initialized: true,
      approvedTangrams: newApprovedTangrams,
      pendingTangrams: newPendingTangrams,
    }
  }, [currentUser, allTangrams])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
