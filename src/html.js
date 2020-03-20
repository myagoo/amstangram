import React from "react"

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <title>Amstangram</title>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <script src="/clipper_unminified.js"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url("https://fonts.googleapis.com/css?family=Sail&display=swap");
              body {
                margin: 0;
                background: #fff;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
                  "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
                  "Helvetica Neue", sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              #gatsby-focus-wrapper{
                width: 100vw;
                height: 100vh;
                display: flex;
                flex-direction: column;
                padding:
                  env(safe-area-inset-top, 0)
                  env(safe-area-inset-right, 0)
                  env(safe-area-inset-bottom, 0)
                  env(safe-area-inset-left, 0);
              }
              
              * {
                box-sizing: border-box;
              }

              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }


            `,
          }}
        />

        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  )
}
