import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useContext,
} from "react"
import { LoginDialog } from "../components/loginDialog"
import { Deferred } from "../utils/deferred"
import { NotifyContext } from "./notify"
import { useTranslate } from "./language"

export const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)
  const getCurrentUserRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)
  const [loginDeferred, setLoginDeferred] = useState(null)
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
          ...user,
          ...documentRef.data(),
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

  const logout = useCallback(() => {
    return firebase.auth().signOut()
  }, [])

  getCurrentUserRef.current = useCallback(async () => {
    if (currentUser) {
      return currentUser
    }
    return login()
  }, [currentUser, login])

  const contextValue = useMemo(
    () => ({ currentUser, login, logout, getCurrentUserRef, usersMetadata }),
    [currentUser, login, logout, usersMetadata]
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
    </UserContext.Provider>
  )
}
