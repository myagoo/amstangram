import React from "react"
import { createPortal } from "react-dom"
import { FiX } from "react-icons/fi"
import {
  COLOR_TRANSITION_DURATION,
  FADE_TRANSITION_DURATION,
} from "../constants"
import { View } from "./view"

export const Dialog = ({ children, title, onClose, css, ...props }) => {
  return createPortal(
    <View
      onClick={onClose}
      css={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "#00000080",
        alignItems: "center",
        justifyContent: "center",
        animation: `${FADE_TRANSITION_DURATION / 2}ms fadeIn ease both`,
        p: 3,
      }}
    >
      <View
        css={{
          flex: "0 1 auto",
          bg: "dialogBackground",
          color: "dialogText",
          borderRadius: 3,
          transition: `background-color ${COLOR_TRANSITION_DURATION}ms, color ${COLOR_TRANSITION_DURATION}ms`,
          fontSize: 3,
          p: 3,
          gap: 3,
          maxWidth: "95vw",
        }}
      >
        <View
          css={{
            flexDirection: "row",
            gap: 3,
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          {title}
          <View
            as={FiX}
            css={{
              cursor: "pointer",
              size: 32,
              ml: title ? undefined : "auto",
            }}
            onClick={onClose}
          ></View>
        </View>
        <View
          onClick={(e) => e.stopPropagation()}
          css={{
            flex: "1",
            ...css,
          }}
          {...props}
        >
          {children}
        </View>
      </View>
    </View>,
    document.getElementById("dialogContainer")
  )
}
