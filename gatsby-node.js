const webpack = require("webpack")

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig()
  config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /jsdom$/ }))
  actions.replaceWebpackConfig(config)
}
