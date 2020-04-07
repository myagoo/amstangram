const React = require("react")
const { TangramsProvider } = require("./src/contexts/tangrams")
require("firebase/auth")
require("firebase/firestore")
exports.wrapPageElement = ({ element }) => {
  return <TangramsProvider>{element}</TangramsProvider>
}
