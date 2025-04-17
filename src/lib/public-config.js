// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components
// Validation happens at app startup in middleware.js

// Helper function to safely access environment variables from multiple sources
function getEnvVar(name) {
  // Check process.env first (standard Next.js approach)
  if (process.env && process.env[name]) {
    return process.env[name];
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Check our custom __NEXT_ENV object
    if (window.__NEXT_ENV && window.__NEXT_ENV[name]) {
      return window.__NEXT_ENV[name];
    }

    // Check if variable was set directly on window
    if (window[name]) {
      return window[name];
    }
  }

  // Variable not found in any location
  return undefined;
}

// Create clean configuration object with values only
export const publicConfig = Object.freeze({
  // API configuration
  get apiBaseUrl() {
    return getEnvVar("NEXT_PUBLIC_API_BASE_URL");
  },
  get apiVersion() {
    const baseUrl = this.apiBaseUrl;
    if (!baseUrl) return "v1";
    const match = baseUrl.match(/\/v\d+\//);
    return match ? match[0].slice(1, -1) : "v1";
  },

  // Spotify configuration
  get spotifyClientId() {
    return getEnvVar("NEXT_PUBLIC_SPOTIFY_CLIENT_ID");
  },
  get spotifyScope() {
    return getEnvVar("NEXT_PUBLIC_SPOTIFY_SCOPE");
  },
  get spotifyRedirectUri() {
    return getEnvVar("NEXT_PUBLIC_SPOTIFY_REDIRECT_URI");
  },
});
