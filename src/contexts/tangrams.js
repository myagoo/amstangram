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
    const newApprovedTangramsByCategory = {}

    for (const tangram of allTangrams) {
      if (tangram.approved) {
        newApprovedTangrams.push(tangram)

        if (!newApprovedTangramsByCategory[tangram.category]) {
          newApprovedTangramsByCategory[tangram.category] = []
        }

        newApprovedTangramsByCategory[tangram.category].push(tangram)
      } else if (
        currentUser &&
        (currentUser.isAdmin || tangram.uid === currentUser.uid)
      ) {
        newPendingTangrams.push(tangram)
      }
    }

    const sortedTangramsByCategory = {}

    for (const sortedCategory of Object.keys(
      newApprovedTangramsByCategory
    ).sort()) {
      sortedTangramsByCategory[sortedCategory] = newApprovedTangramsByCategory[
        sortedCategory
      ].sort(
        sortedCategory === "letters"
          ? sortLettersTangrams
          : sortedCategory === "digits"
          ? sortDigitsTangrams
          : sortTangrams
      )
    }

    return {
      initialized: true,
      approvedTangrams: newApprovedTangrams,
      pendingTangrams: newPendingTangrams,
      approvedTangramsByCategory: newApprovedTangramsByCategory,
    }
  }, [currentUser, allTangrams])

  return (
    <TangramsContext.Provider value={contextValue}>
      {children}
    </TangramsContext.Provider>
  )
}
