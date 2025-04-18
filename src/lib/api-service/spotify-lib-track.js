"use client";

import { withAuthProtection } from "@lib/auth/auth-api";

/**
 * Client-side Spotify API service
 * Properly structured for a frontend-only application
 */

/**
 * Fetches Spotify library tracks
 * @param {Function} authFetch - Authenticated fetch function with session
 * @param {number} page - Page number for pagination
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} - JSON result from the API
 */
async function listSpotifyLibTracksImpl(authFetch, page = 1, pageSize = 50) {
  console.log("fetchSpotifyLibTracks (client API service)");

  const response = await authFetch(`library/uploaded/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

// Export the wrapped API function
export const listSpotifyLibTracks = withAuthProtection(listSpotifyLibTracksImpl);

/**
 * Additional Spotify API functions can be added here
 * Each should be implemented and then wrapped with withAuthProtection
 */
