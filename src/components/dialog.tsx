import React from "react"
import { createPortal } from "react-dom"
import { FiX } from "react-icons/fi"
import { useIntl } from "react-intl"
import { SecondaryButton } from "./button"
import { View } from "./view"

export const Dialog = ({
  children,
  title,
  onClose,
  big,
  css,
  ...props
}: React.PropsWithChildren<
  import("../utils/styles").StyleProps & {
    title?: React.ReactNode
    onClose(): void
    big?: boolean
    as?: "form"
    onSubmit?: React.FormEventHandler
  }
>) => {
  const intl = useIntl()

  return createPortal(
    <View
      onClick={onClose}
      css={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        bg: "#00000080",
        alignItems: "center",
        justifyContent: "center",
        animation: "{durations.dialog} fadeIn ease both",
        p: "3",
      }}
    >
      <View
        css={{
          flex: "0 1 auto",
          bg: "dialogBackground",
          color: "dialogText",
          borderRadius: "3",
          transition:
            "background-color {durations.color}, color {durations.color}",
          fontSize: "3",
          p: "3",
          gap: "3",
          maxWidth: "95vw",
          width: big ? "568px" : "400px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <View
          css={{
            flexDirection: "row",
            gap: "3",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          {title}
          <SecondaryButton
            aria-label={intl.formatMessage({ id: "Close" })}
            css={{
              cursor: "pointer",
              boxSize: "badge",
              ml: title ? undefined : "auto",
              p: 0,
              border: "none",
            }}
            onClick={onClose}
          >
            <View as={FiX} css={{ boxSize: "badge" }} />
          </SecondaryButton>
        </View>
        <View
          css={{
            overflow: "auto",
            flex: "1",
            maxWidth: "100%",
            ...css,
          }}
          {...props}
        >
          {children}
        </View>
      </View>
    </View>,
    document.getElementById("dialogContainer")!
  )
}
