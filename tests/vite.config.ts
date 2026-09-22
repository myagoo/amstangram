import { defineConfig, mergeConfig } from "vite"
import appConfig from "../vite.config.js"

export default mergeConfig(
  appConfig,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^(?:\.\.\/utils\/firebase|\.\/firebase)$/,
          replacement: new URL("./firebase.ts", import.meta.url).pathname,
        },
      ],
    },
  })
)
