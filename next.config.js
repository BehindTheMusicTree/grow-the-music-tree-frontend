/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: false,
  turbopack: {
    root: ".",
    resolveAlias: {
      "@app": "./src/app",
      "@actions": "./src/app/actions",
      "@components": "./src/components",
      "@contexts": "./src/contexts",
      "@layouts": "./src/layouts",
      "@models": "./src/models",
      "@hooks": "./src/hooks",
      "@assets": "./src/assets",
      "@lib": "./src/lib",
      "@utils": "./src/lib/utils",
    },
  },
};

module.exports = nextConfig;
