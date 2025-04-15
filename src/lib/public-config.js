// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components
// Validation happens at app startup in middleware.js

// Extract API version from base URL (helper function)
function getApiVersion(baseUrl) {
  const match = baseUrl.match(/\/v\d+\//);
  return match ? match[0].slice(1, -1) : "v1";
}

// Create clean configuration object with values only
export const publicConfig = Object.freeze({
  // API configuration
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  apiVersion: getApiVersion(process.env.NEXT_PUBLIC_API_BASE_URL),

  // Spotify configuration
  spotifyClientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  spotifyScope: process.env.NEXT_PUBLIC_SPOTIFY_SCOPE,
  spotifyRedirectUri: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
});