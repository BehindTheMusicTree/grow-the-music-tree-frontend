import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "./env/to-load/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@contexts": path.resolve(__dirname, "./src/contexts"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@models": path.resolve(__dirname, "./src/models"),
      "@assets": path.resolve(__dirname, "./src/assets"),
    },
  },
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
      // Extract API version from base URL
      [`/api/${(() => {
        const baseUrl = process.env.VITE_API_BASE_URL;
        if (!baseUrl) return null;
        const versionMatch = baseUrl.match(/\/api\/(v[0-9]+\.[0-9]+\.[0-9]+)\//);
        return versionMatch ? versionMatch[1] : null;
      })()}`]: {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "howler", "prop-types", "hoist-non-react-statics"],
    // Allow Sentry packages to be optimized properly
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
  css: {
    devSourcemap: true,
  },
  define: {
    "process.env.NODE_ENV": '"development"',
  },
  sourcemap: true,
});
