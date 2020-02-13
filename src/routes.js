import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Gallery } from "./components/gallery"
import { Header } from "./components/header"
import { View } from "./components/view"
import { Tangram } from "./pages/tangram"

export const Routes = () => {
  return (
    <BrowserRouter>
      <View
        display="flex"
        height="100vh"
        width="100vw"
        flexDirection="column"
        overflow="hidden"
      >
        <Header />
        <View
          display="flex"
          flexDirection="column"
          height="100%"
          position="relative"
        >
          <Switch>
            <Route exact path="/">
              <Tangram />
              <Gallery />
            </Route>
          </Switch>
        </View>
      </View>
    </BrowserRouter>
  )
}
