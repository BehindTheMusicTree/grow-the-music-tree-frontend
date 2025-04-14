"use server";

import { withAuthProtection } from "@lib/server/auth-api";

// Implementation with authFetch
async function listSpotifyLibTracksImpl(session, authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`library/uploaded/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

export const listSpotifyLibTracks = withAuthProtection(listSpotifyLibTracksImpl);
