"use client";

export async function listManualPlaylists(page = 1, pageSize = 50) {
  const response = await fetch(`manual-playlist/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

export async function createManualPlaylist(manualPlaylistData) {
  const response = await fetch("manual-playlist/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(manualPlaylistData),
  });
  return response.json();
}
