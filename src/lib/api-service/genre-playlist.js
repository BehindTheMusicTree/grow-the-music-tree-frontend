import { withAuthProtection } from "@lib/auth/auth-api";

async function listGenrePlaylistsImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`genre-playlists/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

// Create playlist implementation
async function createGenrePlaylistImpl(authFetch, genreData) {
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
