const React = require("React")
const { ServerStyleSheet, StyleSheetContext } = require("@css-system/use-css")

const stylesheets = new Map()

exports.wrapRootElement = ({ element, pathname }) => {
  const stylesheet = new ServerStyleSheet()

  stylesheets.set(pathname, stylesheet)

  return (
    <StyleSheetContext.Provider value={stylesheet}>
      {element}
    </StyleSheetContext.Provider>
  )
}

exports.onRenderBody = ({ setHeadComponents, pathname }) => {
  const stylesheet = stylesheets.get(pathname)

  if (stylesheet) {
    setHeadComponents([
      React.createElement("style", {
        dangerouslySetInnerHTML: { __html: stylesheet.rules.join(" ") },
      }),
    ])
    stylesheets.delete(pathname)
  }
}
