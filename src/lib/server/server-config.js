// Server-side configuration
// This file contains private, server-only configuration values

// List of required private environment variables
const requiredPrivateVars = ["ENV", "PORT", "SPOTIFY_CLIENT_SECRET", "NEXTAUTH_SECRET"];

// Check for missing required variables
const missingVars = requiredPrivateVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required private environment variables: ${missingVars.join(", ")}`);
}

// Helper to get private environment variables
function getPrivateEnvVar(varName) {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required private environment variable: ${varName}`);
  }
  return value;
}

import { publicConfig } from "../public-config";

// Server configuration object
export const serverConfig = {
  // Environment
  env: getPrivateEnvVar("ENV"),
  port: getPrivateEnvVar("PORT"),

  // Spotify configuration
  spotifyClientSecret: getPrivateEnvVar("SPOTIFY_CLIENT_SECRET"),

  // Auth configuration
  authOptions: {
    secret: getPrivateEnvVar("NEXTAUTH_SECRET"),
    url: `${publicConfig.baseUrl}:${getPrivateEnvVar("PORT")}`,
  },
};
