import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { LoginDialog } from "../components/loginDialog"
import { ProfileDialog } from "../components/profileDialog"
import { Deferred } from "../utils/deferred"
import { useTranslate } from "./language"
import { NotifyContext } from "./notify"

export const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)
  const getCurrentUserRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)
  const [loginDeferred, setLoginDeferred] = useState(null)
  const [profileDialogData, setProfileDialogData] = useState(null)
  const [usersMetadata, setUsersMetadata] = useState(null)

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null)
      } else {
        const documentRef = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get()

        setCurrentUser({
          uid: user.uid,
          ...documentRef.data(),
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

  const login = useCallback(() => {
    const deferred = new Deferred()

    setLoginDeferred(deferred)

    return deferred.promise.finally(() => setLoginDeferred(null))
  }, [])

  const logout = useCallback(async () => {
    if (profileDialogData && profileDialogData.uid === currentUser.uid) {
      profileDialogData.deferred.resolve()
    }
    await firebase.auth().signOut()
    notify(t("Logged out"))
  }, [notify, t, currentUser, profileDialogData])

  getCurrentUserRef.current = useCallback(async () => {
    if (currentUser) {
      return currentUser
    }
    return login()
  }, [currentUser, login])

  const showProfile = useCallback((uid) => {
    const deferred = new Deferred()

    setProfileDialogData({ uid, deferred })

    return deferred.promise.finally(() => setProfileDialogData(null))
  }, [])

  const updateUsername = useCallback(async (currentUser, username) => {
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
      currentUser,
      login,
      logout,
      getCurrentUserRef,
      usersMetadata,
      showProfile,
      updateUsername,
      updatePassword,
      updateEmail,
    }),
    [
      currentUser,
      login,
      logout,
      usersMetadata,
      showProfile,
      updateUsername,
      updatePassword,
      updateEmail,
    ]
  )

  useEffect(() => {
    if (currentUser) {
      notify(t("Logged in as {username}", { username: currentUser.username }))
    }
  }, [currentUser, notify, t])

  return (
    <UserContext.Provider value={contextValue}>
      {children}
      {loginDeferred && <LoginDialog deferred={loginDeferred}></LoginDialog>}
      {profileDialogData && (
        <ProfileDialog {...profileDialogData}></ProfileDialog>
      )}
    </UserContext.Provider>
  )
}
