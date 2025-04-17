"use server";

import { withAuthProtection } from "@lib/server/auth-api";

async function listSpotifyLibTracksImpl(page = 1, pageSize = 50) {
  console.log("listSpotifyLibTracksImpl");
  const response = await authFetch(`library/uploaded/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

export const listSpotifyLibTracks = withAuthProtection(listSpotifyLibTracksImpl);
