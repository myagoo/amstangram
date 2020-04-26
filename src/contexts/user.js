import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

export const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(undefined)
  const [usersMetadata, setUsersMetadata] = useState(null)

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

        const userMetadata = snapshot.data()
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
        const map = {}

        for (const doc of querySnapshot.docs) {
          const metadata = doc.data()
          map[doc.id] = metadata
        }

        setUsersMetadata(map)
      })
    return unsubscribe
  }, [])

  const updateUsername = useCallback(async (currentUser, username) => {
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
    async (currentUser, password, newPassword) => {
      const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.firebaseUser.email,
        password
      )

      await currentUser.firebaseUser.reauthenticateWithCredential(credential)

      await currentUser.firebaseUser.updatePassword(newPassword)
    },
    []
  )

  const updateEmail = useCallback(async (currentUser, newEmail, password) => {
    const credential = firebase.auth.EmailAuthProvider.credential(
      currentUser.firebaseUser.email,
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
