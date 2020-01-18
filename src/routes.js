import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { AnimatedRoute } from "react-router-transition"
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
          </Switch>
          <AnimatedRoute
            path="/gallery"
            atEnter={{ offset: 100 }}
            atLeave={{ offset: 100 }}
            atActive={{ offset: 0 }}
            mapStyles={styles => ({
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: `translateX(${styles.offset}%)`,
            })}
            component={Gallery}
          />
        </View>
      </View>
    </BrowserRouter>
  )
}
