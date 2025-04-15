/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  // Configure webpack to handle the special imports
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@components": "/src/components",
      "@contexts": "/src/contexts",
      "@layouts": "/src/layouts",
      "@utils": "/src/utils",
      "@models": "/src/models",
      "@hooks": "/src/hooks",
      "@assets": "/src/assets",
    };
    return config;
  },
};

module.exports = nextConfig;
