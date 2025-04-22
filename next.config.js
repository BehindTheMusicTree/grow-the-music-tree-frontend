/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  // Configure webpack to handle the special imports and disable minimization
  webpack: (config) => {
    config.optimization.minimize = true;

    // Configure aliases
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
