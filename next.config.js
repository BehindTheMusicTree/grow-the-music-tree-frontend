/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  turbopack: {
    root: path.resolve(__dirname),
    resolveAlias: {
      "@app": "./src/app",
      "@actions": "./src/app/actions",
      "@assets": "./src/assets",
      "@components": "./src/components",
      "@contexts": "./src/contexts",
      "@hooks": "./src/hooks",
      "@layouts": "./src/layouts",
      "@lib": "./src/lib",
      "@models": "./src/models",
      "@utils": "./src/lib/utils",
    },
  },
};

module.exports = nextConfig;
