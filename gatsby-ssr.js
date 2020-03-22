const React = require("react")
const { TangramsProvider } = require("./src/contexts/tangrams")

exports.wrapPageElement = ({ element }) => {
  return <TangramsProvider>{element}</TangramsProvider>
}
