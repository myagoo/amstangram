import React from "react"
import { Gallery } from "../components/gallery"
import { Header } from "../components/header"
import { View } from "../components/view"

export const Layout = ({ children }) => {
  return (
    <View
      css={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Header />
      <View
        css={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
        }}
      >
        {children}
        <Gallery />
      </View>
    </View>
  )
}
