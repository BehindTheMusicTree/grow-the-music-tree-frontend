/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Configure webpack to handle the special imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@app": "/src/app",
      "@actions": "/src/app/actions",
      "@components": "/src/components",
      "@contexts": "/src/contexts",
      "@layouts": "/src/layouts",
      "@models": "/src/models",
      "@hooks": "/src/hooks",
      "@assets": "/src/assets",
      "@lib": "/src/lib",
      "@utils": "/src/lib/utils",
    };
    return config;
  },
};

module.exports = nextConfig;
