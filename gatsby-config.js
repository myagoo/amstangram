const baseTheme = {
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
}

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
    {
      resolve: "@css-system/gatsby-plugin-css-system",
      options: {
        defaultTheme: "light",
        themes: {
          light: {
            ...baseTheme,
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
              difficulties: ["#10ac84", "#2e86de", "#ee5253"],
              background: "#fff",
              galleryBackground: "#ecf0f1",
              galleryText: "#303030",
            },
          },
          dark: {
            ...baseTheme,
            colors: {
              pieces: {
                st1: "#CE9518",
                st2: "#1CACCB",
                mt1: "#0CA57C",
                lt1: "#C33B3B",
                lt2: "#5C2DB9",
                sq: "#C95EBC",
                rh: "#2E75CF",
              },
              difficulties: ["#0b8767", "#1a6cbd", "#ce3737"],
              background: "#232129",
              galleryBackground: "#383838",
              galleryText: "#d8d8d8",
            },
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
