// Server-side configuration
// This file contains private, server-only configuration values

import { publicConfig } from "../public-config";

// Direct access to environment variables
// Store them in variables to ensure they're loaded and verified once
const ENV = process.env.ENV;
const PORT = process.env.PORT;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// List of required private environment variables with their values
const requiredPrivateVars = [
  { name: "ENV", value: ENV },
  { name: "PORT", value: PORT },
  { name: "SPOTIFY_CLIENT_SECRET", value: SPOTIFY_CLIENT_SECRET },
  { name: "NEXTAUTH_SECRET", value: NEXTAUTH_SECRET },
];

// Check for missing required variables
const missingVars = requiredPrivateVars
  .filter(({ value }) => !value)
  .map(({ name }) => name);

if (missingVars.length > 0) {
  throw new Error(`Missing required private environment variables: ${missingVars.join(", ")}`);
}

// Server configuration object
export const serverConfig = {
  // Environment
  env: ENV,
  port: PORT,

  // Spotify configuration
  spotifyClientSecret: SPOTIFY_CLIENT_SECRET,

  // Auth configuration
  authOptions: {
    secret: NEXTAUTH_SECRET,
    url: `${publicConfig.apiBaseUrl.split("/api")[0]}:${PORT}`,
  },
};

// Make the config object immutable to prevent accidental modifications
Object.freeze(serverConfig);