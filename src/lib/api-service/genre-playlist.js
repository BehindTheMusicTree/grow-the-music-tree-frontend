import { useAuthenticatedFetch } from "@hooks/useAuthenticatedFetch";

// Pure API service implementation
async function listGenrePlaylistsImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`genre-playlists/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

async function createGenrePlaylistImpl(authFetch, genreData) {
  const response = await authFetch("genre-playlists/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genreData),
  });
  return response.json();
}

// Export the pure implementations
export { listGenrePlaylistsImpl, createGenrePlaylistImpl };
