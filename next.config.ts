import path from "path";
import type { NextConfig } from "next";
import { version } from "./package.json";
import { publicEnv } from "./src/lib/env";

const nextConfig: NextConfig = {
  output: "standalone",
  env: { NEXT_PUBLIC_APP_VERSION: version },
  images: { unoptimized: true },
  transpilePackages: ["@behindthemusictree/assets"],
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  async rewrites() {
    const origin = publicEnv.NEXT_PUBLIC_UMAMI_ORIGIN;
    if (!origin) return [];
    return [
      { source: "/stats/script.js", destination: `${origin}/script.js` },
      { source: "/stats/api/send", destination: `${origin}/api/send` },
    ];
  },
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
