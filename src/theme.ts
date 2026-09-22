export const COLOR_TRANSITION_DURATION = 250
export const FADE_TRANSITION_DURATION = 1000
export const FADE_STAGGER_DURATION = 500

export const baseTheme = {
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

export type AppTheme = typeof THEMES.light
export const THEMES = {
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
}
