"use client";

export async function listSpotifyLibTracks(authFetch, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`library/spotify-lib-tracks?${params.toString()}`);
  return response.json();
}
