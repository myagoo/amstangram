import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4179", headless: true, channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: {
    command: "vite --config tests/vite.config.ts --host 127.0.0.1 --port 4179 --strictPort",
    url: "http://127.0.0.1:4179",
  },
})
