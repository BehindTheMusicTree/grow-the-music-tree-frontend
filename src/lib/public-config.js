// Public configuration
// This file contains only public, client-safe configuration values
// Can be used by both client and server components
// Validation happens at app startup in middleware.js

// Create clean configuration object with values only
export const publicConfig = Object.freeze({
  // API configuration
  get apiBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  },
  get apiVersion() {
    const baseUrl = this.apiBaseUrl;
    if (!baseUrl) return "v1";
    const match = baseUrl.match(/\/v\d+\//);
    return match ? match[0].slice(1, -1) : "v1";
  },

  // Spotify configuration
  get spotifyClientId() {
    return process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  },
  get spotifyScope() {
    return process.env.NEXT_PUBLIC_SPOTIFY_SCOPE;
  },
  get spotifyRedirectUri() {
    return process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  },
});
