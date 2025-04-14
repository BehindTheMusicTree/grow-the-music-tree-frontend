"use server";

import { withAuthProtection } from "@lib/server/auth-api";
import { authOptions } from "@lib/auth";

// Implementation with authFetch
async function getSpotifyLibTracksImpl(session, authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(
    `${process.env.API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`
  );
  
  return response.json();
}

// Export the protected version
export const getSpotifyLibTracks = withAuthProtection(
  getSpotifyLibTracksImpl, 
  authOptions
);