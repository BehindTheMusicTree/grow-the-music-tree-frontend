/** @type {import('next').NextConfig} */

const path = require("path");

const nextConfig = {
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

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_BACKEND_BASE_URL",
  "NEXT_PUBLIC_CONTACT_EMAIL",
  "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
  "NEXT_PUBLIC_SPOTIFY_SCOPES",
  "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
];

module.exports = (phase, defaultConfig) => {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = process.env[key];
    return !value || value.trim() === "";
  });
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. Set them in .env, .env.local, .env.development, or .env.production.`,
    );
  }
  return nextConfig;
};
