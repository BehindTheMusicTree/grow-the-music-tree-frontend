import path from "path";
import type { NextConfig } from "next";
import "./src/lib/env";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  output: "standalone",
  env: { NEXT_PUBLIC_APP_VERSION: version },
  images: { unoptimized: true },
  transpilePackages: ["@behindthemusictree/assets"],
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

export default nextConfig;
