"use client";

export async function listSpotifyLibTracks(authFetch, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`library/spotify?${params.toString()}`);
  return response.json();
}

export async function quickSyncSpotifyLibTracks(authFetch) {
  const response = await authFetch("library/spotify/quick-sync");
  return response.json();
}

export async function fullSyncSpotifyLibTracks(authFetch) {
  const response = await authFetch("library/spotify/full-sync");
  return response.json();
}
