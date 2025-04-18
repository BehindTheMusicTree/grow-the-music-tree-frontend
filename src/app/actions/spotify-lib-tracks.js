"use client";

import { withAuthProtection } from "@lib/auth/auth-api";

/**
 * Client-side implementation of Spotify library tracks API
 * @param {Function} authFetch - Authenticated fetch function with session
 * @param {number} page - Page number for pagination (default: 1)
 * @param {number} pageSize - Number of items per page (default: 50)
 * @returns {Promise<Object>} - JSON result from the API
 */
async function listSpotifyLibTracksImpl(authFetch, page = 1, pageSize = 50) {
  console.log("listSpotifyLibTracksImpl (client-side)");

  // Use the same endpoint pattern as the server implementation
  const response = await authFetch(`library/uploaded/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

// Wrap with client-side auth protection - handles session check, errors, etc.
export const listSpotifyLibTracks = withAuthProtection(listSpotifyLibTracksImpl);
