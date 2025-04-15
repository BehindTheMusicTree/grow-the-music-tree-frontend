// Server-side configuration
// This file contains private, server-only configuration values
// Validation happens at app startup in middleware.js

import { publicConfig } from "@lib/public-config";

// Create clean configuration object with values only
export const serverConfig = {
  // Environment
  env: process.env.ENV,
  port: process.env.PORT,

  // Spotify
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,

  // Auth
  authSecret: process.env.NEXTAUTH_SECRET,
  get authUrl() {
    const baseUrl = publicConfig.apiBaseUrl;
    if (!baseUrl) return `http://localhost:${this.port}`;
    const base = baseUrl.split("/api")[0];
    return `${base}:${this.port}`;
  },
};
