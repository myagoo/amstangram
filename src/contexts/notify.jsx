import React, { createContext, useCallback, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { View } from "../components/view"
import { FADE_TRANSITION_DURATION } from "../constants"
import { extendPrimitive } from "css-system"

const Notification = extendPrimitive(View, {
  css: {
    fontSize: 3,
    p: 2,
    borderRadius: 1,
    bg: "notificationBackground",
    color: "dialogText",
    animation: `${FADE_TRANSITION_DURATION / 2}ms fadeIn both`,
    boxShadow: "0px 0px 10px #00000080",
  },
})

export const NotifyContext = createContext(null)

export const NotifyProvider = ({ children }) => {
  const notificationRef = useRef()
  const [notificationData, setNotificationData] = useState(null)

  const notify = useCallback((content) => {
    setNotificationData((prevNotificationData) => {
      if (prevNotificationData) {
        clearTimeout(prevNotificationData.timeoutId)
      }

      return {
        content,
        timeoutId: setTimeout(() => {
          setNotificationData(null)
        }, 2000),
      }
    })
  }, [])

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      {notificationData &&
        createPortal(
          <View
            css={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              pointerEvents: "none",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Notification ref={notificationRef}>
              {notificationData.content}
            </Notification>
          </View>,
          document.getElementById("notificationContainer")
        )}
    </NotifyContext.Provider>
  )
}
