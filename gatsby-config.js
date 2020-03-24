module.exports = {
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/tangrams`,
        name: "tangrams",
      },
    },
    "gatsby-transformer-json",
    {
      resolve: "@css-system/gatsby-plugin-css-system",
      options: {
        theme: {
          breakpoints: {
            s: "40em",
            m: "52em",
            l: "64em",
          },
          space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
          sizes: {
            button: 64,
          },
          fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
          colors: {
            pieces: {
              st1: "#FECA57",
              st2: "#48DBFB",
              mt1: "#1DD1A1",
              lt1: "#FF6B6B",
              lt2: "#8557E0",
              sq: "#FF9FF3",
              rh: "#54A0FF",
            },
            collision: "#bdc3c7",
            background: "#b7efe0",
          },
        },
      },
    },
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
