"use client";

export async function listGenrePlaylists(page = 1, pageSize = 50) {
  const response = await fetch(`genre-playlist/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

export async function createGenrePlaylist(genreData) {
  const response = await fetch("genre-playlists/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genreData),
  });
  return response.json();
}
