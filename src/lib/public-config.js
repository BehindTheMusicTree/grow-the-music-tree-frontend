// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components

// Direct access to environment variables
// Store them in variables to ensure they're loaded and verified once
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const NEXT_PUBLIC_SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const NEXT_PUBLIC_SPOTIFY_SCOPE = process.env.NEXT_PUBLIC_SPOTIFY_SCOPE;
const NEXT_PUBLIC_SPOTIFY_REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;

// List of required public environment variables with their values
const requiredPublicVars = [
  { name: "NEXT_PUBLIC_API_BASE_URL", value: NEXT_PUBLIC_API_BASE_URL },
  { name: "NEXT_PUBLIC_SPOTIFY_SCOPE", value: NEXT_PUBLIC_SPOTIFY_SCOPE },
  { name: "NEXT_PUBLIC_SPOTIFY_REDIRECT_URI", value: NEXT_PUBLIC_SPOTIFY_REDIRECT_URI },
];

// Check for missing required variables
const missingVars = requiredPublicVars.filter(({ value }) => !value).map(({ name }) => name);

if (missingVars.length > 0) {
  throw new Error(`Missing required public environment variables: ${missingVars.join(", ")}`);
}

// Extract API version from base URL
function getApiVersion(baseUrl) {
  const match = baseUrl.match(/\/v\d+\//);
  return match ? match[0].slice(1, -1) : "v1";
}

// Public configuration object
export const publicConfig = {
  // API configuration
  apiBaseUrl: NEXT_PUBLIC_API_BASE_URL,
  apiVersion: getApiVersion(NEXT_PUBLIC_API_BASE_URL),

  // Spotify configuration
  spotifyClientId: NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  spotifyScope: NEXT_PUBLIC_SPOTIFY_SCOPE,
  spotifyRedirectUri: NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
};

// Make the config object immutable to prevent accidental modifications
Object.freeze(publicConfig);
