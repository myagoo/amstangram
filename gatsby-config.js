module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/tangrams`,
        name: "tangrams",
      },
    },
    "gatsby-transformer-svg",
    "@css-system/gatsby-plugin-css-system",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Amstangram",
        short_name: "Amstangram",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#1DD1A1",
        display: "standalone",
        icon: "src/icon-512x512.png",
      },
    },
    "gatsby-plugin-offline",
  ],
}
