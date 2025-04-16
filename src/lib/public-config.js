// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components
// Validation happens at app startup in middleware.js

// Helper to get environment variables with fallback to window._env_
const getEnvValue = (nextPublicName, viteName) => {
  // First try Next.js standard env var
  if (process.env[nextPublicName]) {
    return process.env[nextPublicName];
  }

  // Fallback to window._env_ (if in browser and available)
  if (typeof window !== "undefined" && window._env_ && window._env_[viteName]) {
    return window._env_[viteName];
  }

  // Return undefined if not found in either place
  return undefined;
};

// Create clean configuration object with values only
export const publicConfig = Object.freeze({
  // API configuration
  get apiBaseUrl() {
    return getEnvValue("NEXT_PUBLIC_API_BASE_URL", "VITE_API_BASE_URL");
  },
  get apiVersion() {
    const baseUrl = this.apiBaseUrl;
    if (!baseUrl) return "v1";
    const match = baseUrl.match(/\/v\d+\//);
    return match ? match[0].slice(1, -1) : "v1";
  },

  // Spotify configuration
  get spotifyClientId() {
    return getEnvValue("NEXT_PUBLIC_SPOTIFY_CLIENT_ID", "VITE_SPOTIFY_CLIENT_ID");
  },
  get spotifyScope() {
    return getEnvValue("NEXT_PUBLIC_SPOTIFY_SCOPE", "VITE_SPOTIFY_SCOPE");
  },
  get spotifyRedirectUri() {
    return getEnvValue("NEXT_PUBLIC_SPOTIFY_REDIRECT_URI", "VITE_SPOTIFY_REDIRECT_URI");
  },
});
