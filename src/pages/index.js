import { useGlobalCss } from "css-system"
import { ThemeToggler } from "gatsby-plugin-dark-mode"
import React from "react"
import { FiMoon, FiSun } from "react-icons/fi"
import { Button } from "../components/button"
import { Gallery } from "../components/gallery"
import { Tangram } from "../components/tangram"
import { View } from "../components/view"

export default () => {
  useGlobalCss({
    body: {
      m: 0,
      bg: "backgroundLight",
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
        "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif`,
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
      transition: "background 200ms",
    },
    "body.dark": {
      bg: "backgroundDark",
    },
    "body, html, #___gatsby, #gatsby-focus-wrapper": {
      height: "100%",
    },

    ".gallery": {
      color: "galleryTextLight",
      bg: "galleryBackgroundLight",
      transition: "background 200ms, color 200ms",
    },
    "body.dark .gallery": {
      color: "galleryTextDark",
      bg: "galleryBackgroundDark",
    },

    ".card": {
      bg: "backgroundLight",
      transition: "background 200ms",
    },
    "body.dark .card": {
      bg: "backgroundDark",
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
    },
  })

  return (
    <>
      <Tangram />
      <Gallery />
      <ThemeToggler>
        {({ theme, toggleTheme }) => (
          <Button
            css={{
              position: "fixed",
              left: 3,
              bottom: 3,
            }}
            onClick={() => toggleTheme(theme === "dark" ? "light" : "dark")}
          >
            <View as={theme === "dark" ? FiSun : FiMoon} css={{ m: "auto" }} />
          </Button>
        )}
      </ThemeToggler>
    </>
  )
}
