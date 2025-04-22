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
  const response = await authFetch("library/spotify/sync/quick", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

export async function fullSyncSpotifyLibTracks(authFetch) {
  const response = await authFetch("library/spotify/sync/full", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
}
