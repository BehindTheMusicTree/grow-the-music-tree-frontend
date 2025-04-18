import { useAuthenticatedFetch } from "@hooks/useAuthenticatedFetch";

// Pure API service implementations
async function listManualPlaylistsImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`manual-playlists/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

async function createManualPlaylistImpl(authFetch, playlistData) {
  const response = await authFetch("manual-playlists/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(playlistData),
  });
  return response.json();
}

// Export the pure implementations
export { listManualPlaylistsImpl, createManualPlaylistImpl };
