var bodyParser = require("body-parser")
const fs = require("fs")
const path = require("path")
const webpack = require("webpack")

exports.onCreateDevServer = ({ app }) => {
  app.use(bodyParser.json())

  app.post("/save", function(req, res) {
    fs.writeFileSync(
      path.join(
        process.cwd(),
        "tangrams",
        req.body.category + "-" + req.body.label + ".json"
      ),
      JSON.stringify(req.body, null, 2)
    )
    res.sendStatus(200)
  })

  app.post("/magic", function(req, res) {
    req.body.forEach(({ filename, ...tangram }) => {
      fs.writeFileSync(
        path.join(process.cwd(), "tangrams", filename + ".json"),
        JSON.stringify(tangram, null, 2)
      )
    })
    res.sendStatus(200)
  })
}

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig()
  config.plugins.push(new webpack.IgnorePlugin(/jsdom$/))
  actions.replaceWebpackConfig(config)
}
