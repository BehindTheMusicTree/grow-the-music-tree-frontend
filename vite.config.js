import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "./env/to-load/",
  plugins: [
    react({
      babel: {
        sourceMaps: true,
      },
      jsxRuntime: "automatic",
      jsxImportSource: "react",
    }),
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
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false,
      },
    },
  },
  server: {
    host: true,
    port: 5000,
    proxy: {
      "/api/v0.1.1": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "howler", "prop-types", "hoist-non-react-statics"],
    exclude: ["@sentry/react", "@sentry/tracing", "@sentry-internal/tracing", "@sentry/utils"],
    esbuildOptions: {
      sourcemap: true,
      minify: false,
      target: "esnext",
      supported: {
        "dynamic-import": true,
      },
    },
  },
  esbuild: {
    sourcemap: true,
    exclude: ["**/node_modules/**", "**/installHook.js", "**/react_devtools_backend_compact.js"],
    minify: false,
    target: "esnext",
    supported: {
      "dynamic-import": true,
    },
  },
  resolve: {
    alias: {
      "hoist-non-react-statics": "hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js",
    },
  },
  css: {
    devSourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": '"development"',
  },
  sourcemap: true,
});
