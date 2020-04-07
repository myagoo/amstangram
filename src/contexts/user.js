import firebase from "gatsby-plugin-firebase"
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react"
import { LoginDialog } from "../components/loginDialog"
import { Deferred } from "../utils/deferred"

export const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const getCurrentUserRef = useRef()
  const [currentUser, setCurrentUser] = useState(null)
  const [loginDeferred, setLoginDeferred] = useState(null)

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
          ...documentRef.data(),
          uid: user.uid,
        })
      }
    })
    return unsubscribe
  }, [])

  const login = useCallback(() => {
    const deferred = new Deferred()

    setLoginDeferred(deferred)

    return deferred.promise.finally(() => setLoginDeferred(null))
  }, [])

  getCurrentUserRef.current = useCallback(async () => {
    if (currentUser) {
      return currentUser
    }
    return login()
  }, [currentUser, login])

  const contextValue = useMemo(
    () => ({ currentUser, login, getCurrentUserRef }),
    [currentUser, login]
  )

  return (
    <UserContext.Provider value={contextValue}>
      {children}
      {loginDeferred && <LoginDialog deferred={loginDeferred}></LoginDialog>}
    </UserContext.Provider>
  )
}
