import { defineConfig } from "@pandacss/dev"
import { baseTheme, THEMES, COLOR_TRANSITION_DURATION, FADE_TRANSITION_DURATION, FADE_STAGGER_DURATION } from "./src/theme"

const pixels = (values: Record<string, number> | number[]) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value: `${value}px` }]))

const colorToken = (light: string, dark: string) => ({ value: { base: light, _dark: dark } })
const colors = {
  ...Object.fromEntries(Object.entries(THEMES.light.colors).flatMap(([name, light]) =>
    typeof light === "string" ? [[name, colorToken(light, String(THEMES.dark.colors[name as keyof typeof THEMES.dark.colors]))]] : [],
  )),
  pieces: Object.fromEntries(Object.entries(THEMES.light.colors.pieces).map(([name, light]) =>
    [name, colorToken(light, THEMES.dark.colors.pieces[name as keyof typeof THEMES.dark.colors.pieces])],
  )),
  difficulties: Object.fromEntries(THEMES.light.colors.difficulties.map((light, index) =>
    [index, colorToken(light, THEMES.dark.colors.difficulties[index])],
  )),
}

const gradient = (property: string) => Object.fromEntries(
  ["lt2", "rh", "st2", "mt1", "st1", "lt1", "sq", "lt2"].map((piece, index) => [
    `${[0, 14, 28, 42, 57, 71, 85, 100][index]}%`,
    { [property]: `{colors.pieces.${piece}}` },
  ]),
)

export default defineConfig({
  preflight: false,
  include: ["./src/**/*.{ts,tsx}"],
  jsxFramework: "react",
  jsxStyleProps: "minimal",
  outdir: "styled-system",
  conditions: { extend: { dark: '[data-theme="dark"] &' } },
  theme: {
    breakpoints: { sm: baseTheme.breakpoints.s, md: baseTheme.breakpoints.m, lg: baseTheme.breakpoints.l },
    tokens: {
      durations: {
        color: { value: `${COLOR_TRANSITION_DURATION}ms` },
        fade: { value: `${FADE_TRANSITION_DURATION}ms` },
        stagger: { value: `${FADE_STAGGER_DURATION}ms` },
        dialog: { value: `${FADE_TRANSITION_DURATION / 2}ms` },
      },
      spacing: pixels(baseTheme.space),
      sizes: pixels(baseTheme.sizes),
      radii: pixels(baseTheme.radii),
      fontSizes: pixels(baseTheme.fontSizes),
      borderWidths: pixels(baseTheme.borderWidths),
    },
    semanticTokens: { colors },
    keyframes: {
      pieceColor: gradient("color"),
      pieceBackground: gradient("backgroundColor"),
      flight: { from: { transform: "translate(0, 0)" }, to: { transform: "translate(30px, -30px)" } },
      emojiSpin: { from: { opacity: "0", transform: "rotate(0) scale(0)" }, to: { opacity: "1", transform: "rotate(1800deg) scale(1)" } },
    },
  },
  globalCss: {
    body: {
      margin: 0, bg: "background", fontFamily: "'Comic Neue', cursive", fontWeight: "bolder",
      WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
      transition: "background-color 250ms",
    },
    "body, html, #root": { height: "100%" },
    "#root": {
      display: "flex", flexDirection: "column",
      padding: "env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0)",
    },
    "*": { boxSizing: "border-box", userSelect: "none", WebkitTapHighlightColor: "rgba(0,0,0,0)" },
    "input, textarea": { userSelect: "initial" },
  },
})
