module.exports = {
  plugins: [
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // The property ID; the tracking code won't be generated without it
        trackingId: "UA-162030789-1",
        anonymize: true,
        respectDNT: true,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/tangrams`,
        name: "tangrams",
      },
    },
    "gatsby-transformer-json",
    "gatsby-plugin-dark-mode",
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
            backgroundLight: "#fff",
            backgroundDark: "#232129",
            galleryBackgroundLight: "#ecf0f1",
            galleryTextLight: "#000000CC",
            galleryBackgroundDark: "#383838",
            galleryTextDark: "#FFFFFFCC",
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
