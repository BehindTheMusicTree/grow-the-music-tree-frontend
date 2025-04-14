// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components

// List of required public environment variables
const requiredPublicVars = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SPOTIFY_CLIENT_ID",
  "NEXT_PUBLIC_SPOTIFY_SCOPE",
  "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI",
];

// Check for missing required variables
const missingVars = requiredPublicVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  throw new Error(`Missing required public environment variables: ${missingVars.join(", ")}`);
}

// Helper to get public environment variables
function getPublicEnvVar(varName) {
  const value = process.env[varName];
  if (!value) {
    throw new Error(`Missing required public environment variable: ${varName}`);
  }
  return value;
}

// Extract API version from base URL
function getApiVersion(baseUrl) {
  const match = baseUrl.match(/\/v\d+\//);
  return match ? match[0].slice(1, -1) : "v1";
}

// Public configuration object
export const publicConfig = {
  // API configuration
  apiBaseUrl: getPublicEnvVar("NEXT_PUBLIC_API_BASE_URL"),
  apiVersion: getApiVersion(getPublicEnvVar("NEXT_PUBLIC_API_BASE_URL")),

  // Spotify configuration
  spotifyClientId: getPublicEnvVar("NEXT_PUBLIC_SPOTIFY_CLIENT_ID"),
  spotifyScope: getPublicEnvVar("NEXT_PUBLIC_SPOTIFY_SCOPE"),
  spotifyRedirectUri: getPublicEnvVar("NEXT_PUBLIC_SPOTIFY_REDIRECT_URI"),
};
