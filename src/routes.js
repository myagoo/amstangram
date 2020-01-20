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
            </Route>
          </Switch>
          <View
            as={AnimatedRoute}
            path="/gallery"
            atEnter={{ offset: 100 }}
            atLeave={{ offset: 100 }}
            atActive={{ offset: 0 }}
            mapStyles={styles => ({
              width: "100%",
              height: "100%",
              left: styles.offset,
              position: "absolute",
              flex: "1",
              transform: `translateX(${styles.offset}%)`,
            })}
            component={Gallery}
          />
        </View>
      </View>
    </BrowserRouter>
  )
}
