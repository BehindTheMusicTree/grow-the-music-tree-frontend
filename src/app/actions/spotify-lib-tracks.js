"use server";

import { withAuthHandling } from "@lib/auth-error-handler";

async function listSpotifyLibTracksImpl(session, page = 1, pageSize = 50) {
  const response = await fetch(`${process.env.API_BASE_URL}library/spotify/?page=${page}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Spotify library tracks");
  }

  return response.json();
}

export const listSpotifyLibTracks = withAuthHandling(listSpotifyLibTracksImpl);
