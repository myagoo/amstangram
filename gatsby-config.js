const baseTheme = {
  breakpoints: {
    s: "40em",
    m: "52em",
    l: "64em",
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: {
    menu: 40,
    inline: 16,
    logo: 128,
    icon: 24,
    badge: 32,
    badgeBig: 86,
  },
  borderWidths: {
    loader: 8,
  },
  radii: [0, 4, 8, 16, 32],
  fontSizes: [10, 12, 14, 18, 22, 30, 46, 62, 70],
}

const firebaseConfig =
  process.env.NODE_ENV === "production"
    ? require("./firebase-config.js")
    : require("./firebase-staging-config.js")

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
      resolve: "gatsby-plugin-firebase",
      options: {
        credentials: firebaseConfig,
      },
    },
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
              shape: "#121212",
              background: "#fff",
              dialogBackground: "#d9d9d9",
              dialogText: "#303030",
              inputBackground: "#fff",
              errorText: "#bd0808",
              notificationBackground: "#FFFFFFdd",
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
              shape: "#595959",
              background: "#15141a",
              dialogBackground: "#383838",
              dialogText: "#d8d8d8",
              inputBackground: "#595959",
              errorText: "#e63c3c",
              notificationBackground: "#000000dd",
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
        icon: "src/maskable_icon.png",
        icon_options: {
          purpose: "maskable",
        },
        include_favicon: false,
      },
    },
    "gatsby-plugin-offline",
  ],
}
