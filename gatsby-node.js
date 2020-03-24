var bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
const webpack = require("webpack")

exports.onCreateDevServer = ({ app }) => {
  app.use(bodyParser.json())
  app.post("/save", function(req, res) {
    fs.writeFileSync(
      path.join(process.cwd(), "tangrams", Date.now() + ".json"),
      JSON.stringify(req.body)
    )
    res.sendStatus(200)
  })
}

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig()
  config.plugins.push(new webpack.IgnorePlugin(/jsdom$/))
  actions.replaceWebpackConfig(config)
}
