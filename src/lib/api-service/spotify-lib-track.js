"use client";

export async function listSpotifyLibTracks(page = 1, pageSize = 50) {
  const response = await fetch(`spotify-lib-tracks/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}
