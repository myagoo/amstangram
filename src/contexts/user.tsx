import firebase from "../utils/firebase"
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

import type { CurrentUser, UserMetadata } from "../types"

interface UserContextValue {
  initialized: boolean
  currentUser: CurrentUser | null | undefined
  usersMetadata: Record<string, UserMetadata> | null
  updateUsername(user: CurrentUser, username: string): Promise<void>
  updatePassword(user: CurrentUser, password: string, newPassword: string): Promise<void>
  updateEmail(user: CurrentUser, newEmail: string, password: string): Promise<void>
}
export const UserContext = createContext<UserContextValue>(null!)

export const UserProvider = ({ children }: React.PropsWithChildren) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>()
  const [usersMetadata, setUsersMetadata] = useState<Record<string, UserMetadata> | null>(null)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (currentUser !== undefined && usersMetadata !== null) {
      setInitialized(true)
    }
  }, [currentUser, usersMetadata])

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null)
      } else {
        // This read is redundant
        const snapshot = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get()

        const userMetadata = snapshot.data() as UserMetadata
        setCurrentUser({
          uid: user.uid,
          ...userMetadata,
          firebaseUser: user,
        })
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .onSnapshot((querySnapshot) => {
        const map: Record<string, UserMetadata> = {}

        for (const doc of querySnapshot.docs) {
          const metadata = doc.data() as UserMetadata
          map[doc.id] = metadata
        }

        setUsersMetadata(map)
      })
    return unsubscribe
  }, [])

  const updateUsername = useCallback(async (currentUser: CurrentUser, username: string) => {
    await currentUser.firebaseUser.updateProfile({
      displayName: username,
    })

    await firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .update({ username })

    setCurrentUser({ ...currentUser, username })
  }, [])

  const updatePassword = useCallback(
    async (currentUser: CurrentUser, password: string, newPassword: string) => {
      const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.firebaseUser.email!,
        password
      )

      await currentUser.firebaseUser.reauthenticateWithCredential(credential)

      await currentUser.firebaseUser.updatePassword(newPassword)
    },
    []
  )

  const updateEmail = useCallback(async (currentUser: CurrentUser, newEmail: string, password: string) => {
    const credential = firebase.auth.EmailAuthProvider.credential(
      currentUser.firebaseUser.email!,
      password
    )

    await currentUser.firebaseUser.reauthenticateWithCredential(credential)

    await currentUser.firebaseUser.updateEmail(newEmail)
  }, [])

  const contextValue = useMemo(
    () => ({
      initialized,
      currentUser,
      usersMetadata,
      updateUsername,
      updatePassword,
      updateEmail,
    }),
    [
      initialized,
      currentUser,
      usersMetadata,
      updateUsername,
      updatePassword,
      updateEmail,
    ]
  )

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}
