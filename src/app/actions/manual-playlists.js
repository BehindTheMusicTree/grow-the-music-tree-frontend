"use server";

import { withAuthProtection } from "@lib/auth/auth-api";

async function listManualPlaylistsImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`manual-playlists/?page=${page}&pageSize=${pageSize}`);

  if (!response.ok) {
    throw new Error("Failed to fetch genre playlists");
  }

  return response.json();
}

async function createManualPlaylistImpl(authFetch, playlistData) {
  const response = await authFetch("manual-playlists/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playlistData),
  });

  if (!response.ok) {
    throw new Error("Failed to create manual playlist");
  }

  return response.json();
}

export const listManualPlaylists = withAuthProtection(listManualPlaylistsImpl);
export const createManualPlaylist = withAuthProtection(createManualPlaylistImpl);
