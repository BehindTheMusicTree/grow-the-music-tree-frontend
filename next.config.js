/** @type {import('next').NextConfig} */

// Validate environment variables at build time
const requiredPublicVars = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
  "NEXT_PUBLIC_SPOTIFY_SCOPE",
  "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
];

const requiredPrivateVars = ["ENV", "PORT", "NEXTAUTH_SECRET"];

// Check for missing variables
const missingPublicVars = requiredPublicVars.filter((name) => !process.env[name]);
const missingPrivateVars = requiredPrivateVars.filter((name) => !process.env[name]);

if (missingPublicVars.length > 0 || missingPrivateVars.length > 0) {
  const errors = [];
  if (missingPublicVars.length > 0) {
    errors.push(`Missing public variables: ${missingPublicVars.join(", ")}`);
  }
  if (missingPrivateVars.length > 0) {
    errors.push(`Missing private variables: ${missingPrivateVars.join(", ")}`);
  }
  throw new Error(`Environment validation failed:\n${errors.join("\n")}`);
}

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
  // Handle API requests to the Django backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
