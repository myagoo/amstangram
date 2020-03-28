import { useGlobalCss } from "css-system"
import { useSwitchTheme } from "@css-system/gatsby-plugin-css-system"
import React from "react"
import { FiMoon, FiSun } from "react-icons/fi"
import { Button } from "../components/button"
import { Gallery } from "../components/gallery"
import { Tangram } from "../components/tangram"
import { View } from "../components/view"
import {
  FADEIN_TRANSITION_DURATION,
  COLOR_TRANSITION_DURATION,
  FADEIN_STAGGER_DURATION,
} from "../constants"

export default () => {
  useGlobalCss({
    body: {
      m: 0,
      bg: "background",
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
        "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif`,
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
      transition: `background-color ${COLOR_TRANSITION_DURATION}ms`,
    },
    "body, html, #___gatsby, #gatsby-focus-wrapper": {
      height: "100%",
    },
    "#gatsby-focus-wrapper": {
      display: "flex",
      flexDirection: "column",
      padding: `
        env(safe-area-inset-top, 0)
        env(safe-area-inset-right, 0)
        env(safe-area-inset-bottom, 0)
        env(safe-area-inset-left, 0)
      `,
    },
    "*": {
      boxSizing: "border-box",
      userSelect: "none",
      "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
    },
  })

  const [themeKey, switchTheme] = useSwitchTheme()

  return (
    <>
      <Tangram />
      <Gallery />
      <View
        css={{
          position: "fixed",
          left: 3,
          bottom: 3,
          animation: `${FADEIN_TRANSITION_DURATION}ms fadeIn ${FADEIN_STAGGER_DURATION *
            2}ms ease both`,
        }}
      >
        <Button
          css={{
            position: "fixed",
            left: 3,
            bottom: 3,
          }}
          onClick={() => switchTheme(themeKey === "dark" ? "light" : "dark")}
        >
          <View as={themeKey === "dark" ? FiSun : FiMoon} css={{ m: "auto" }} />
        </Button>
      </View>
    </>
  )
}
