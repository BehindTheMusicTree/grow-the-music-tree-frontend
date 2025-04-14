"use server";

import { withAuthProtection } from "@lib/server/auth-api";

// Clean implementation using authFetch
async function listGenrePlaylistsImpl(session, authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`genre-playlists/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

// Create playlist implementation
async function createGenrePlaylistImpl(session, authFetch, genreData) {
  const response = await authFetch("genre-playlists/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genreData),
  });

  return response.json();
}

// Export protected versions
export const listGenrePlaylists = withAuthProtection(listGenrePlaylistsImpl);
export const createGenrePlaylist = withAuthProtection(createGenrePlaylistImpl);
