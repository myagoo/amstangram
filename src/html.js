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
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta property="og:title" content="Amstangram" />
        <meta
          property="og:description"
          content="The evergrowing tangrams collection."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://amstangr.am/banner.png" />
        <meta property="og:url" content="https://amstangr.am" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="fb:app_id" content="654214645128292" />
        <script src="/clipper_unminified.js"></script>
        <style
          dangerouslySetInnerHTML={{
            __html: `
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
        <div id="dialogContainer"></div>
        <div id="notificationContainer"></div>
        {props.postBodyComponents}
      </body>
    </html>
  )
}
