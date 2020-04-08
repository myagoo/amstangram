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
  radii: [0, 4, 8, 16, 32],
  fontSizes: [10, 12, 14, 18, 22, 30, 46, 62, 70],
}

module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-sentry",
      options: {
        dsn:
          "https://1b2f34262d80460298da419637b59901@o375098.ingest.sentry.io/5194058",
        environment: process.env.NODE_ENV,
        enabled: process.env.NODE_ENV === "production",
      },
    },
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
        credentials: {
          apiKey: "AIzaSyAHOemftrTSOUjtoA6K3VR2hkOU5H-ScSI",
          authDomain: "amstangram.firebaseapp.com",
          databaseURL: "https://amstangram.firebaseio.com",
          projectId: "amstangram",
          storageBucket: "amstangram.appspot.com",
          messagingSenderId: "1075176148116",
          appId: "1:1075176148116:web:e61e6512cd983a75533881",
          measurementId: "G-PLH3BSWLM2",
        },
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
              background: "#fff",
              galleryBackground: "#e0e0e0",
              galleryText: "#303030",
              inputBackground: "#FFF",
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
              background: "#232129",
              galleryBackground: "#383838",
              galleryText: "#d8d8d8",
              inputBackground: "#4e4e4e",
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
        icon: "src/icon-512x512.png",
      },
    },
    "gatsby-plugin-offline",
  ],
}
