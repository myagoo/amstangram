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

              body, html, #___gatsby, #gatsby-focus-wrapper {
                height: 100%;
              }

              #gatsby-focus-wrapper{
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

              @keyframes spinAndGrow {
                0% {
                  opacity: 0;
                  font-size: 0;
                  transform: rotate(0);
                }
                33% {
                  opacity: 1;
                  font-size: 30vmin;
                  transform: rotate(3645deg);
                }
                66% {
                  opacity: 1;
                  font-size: 30vmin;
                  transform: rotate(3600deg);
                }
                100% {
                  opacity: 0;
                  font-size: 30vmin;
                  transform: rotate(3600deg);
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
