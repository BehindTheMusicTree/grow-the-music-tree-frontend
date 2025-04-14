"use server";

import { withAuthProtection } from "@lib/server/auth-api";

// Clean implementation using authFetch
async function listGenrePlaylistsImpl(session, authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/?page=${page}&pageSize=${pageSize}`
  );

  return response.json();
}

// Create playlist implementation
async function createGenrePlaylistImpl(session, authFetch, genreData) {
  const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genreData),
  });

  return response.json();
}

// Export protected versions
export const listGenrePlaylists = withAuthProtection(listGenrePlaylistsImpl);
export const createGenrePlaylist = withAuthProtection(createGenrePlaylistImpl);
