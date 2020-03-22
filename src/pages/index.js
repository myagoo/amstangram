import { useGlobalCss } from "css-system"
import React from "react"
import { Gallery } from "../components/gallery"
import { Tangram } from "../components/tangram"

export default () => {
  useGlobalCss({
    body: {
      m: 0,
      bg: "#fff",
      fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
        "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
        "Helvetica Neue", sans-serif`,
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
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
    },
  })

  return (
    <>
      <Tangram />
      <Gallery />
    </>
  )
}
