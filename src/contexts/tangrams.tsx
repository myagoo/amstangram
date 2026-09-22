import firebase from "../utils/firebase"
import React, {
  createContext,
  useEffect,
  useState,
  useMemo,
  useContext,
} from "react"
import { UserContext } from "./user"

import type { SavedTangram } from "../types"
interface TangramsContextValue {
  initialized: boolean
  approvedTangrams: SavedTangram[] | null
  pendingTangrams: SavedTangram[] | null
}
export const TangramsContext = createContext<TangramsContextValue>(null!)

export const TangramsProvider = ({ children }: React.PropsWithChildren) => {
  const { currentUser } = useContext(UserContext)
  const [allTangrams, setAllTangrams] = useState<SavedTangram[] | null>(null)

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("tangrams")
      .onSnapshot((collectionSnapshot) => {
        const newAllTangrams = []
        for (const doc of collectionSnapshot.docs) {
          const id = doc.id
          const { ...tangram } = doc.data() as Omit<SavedTangram, "id">

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
