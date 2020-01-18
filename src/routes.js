import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Header } from "./components/header"
import { View } from "./components/view"
import { Gallery } from "./pages/gallery"
import { Tangram } from "./pages/tangram"

export const Routes = () => {
  return (
    <BrowserRouter>
      <View>
        <Header />
        <View
          display="flex"
          flexDirection="column"
          height="100vh"
          width="100vw"
        >
          <Switch>
            <Route exact path="/">
              <Tangram />
            </Route>
            <Route path="/gallery">
              <Gallery />
            </Route>
          </Switch>
        </View>
      </View>
    </BrowserRouter>
  )
}
