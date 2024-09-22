import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "./env/to-load/",
  plugins: [
    react(),
    eslintPlugin(),
    sentryVitePlugin({
      org: "bodzify",
      project: "ultimate-music-guide-react-test",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    }),
  ],
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    host: true,
    port: 5000,
  },
});
