"use client";

export async function listGenrePlaylists(authFetch, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`genre-playlists?${params.toString()}`);
  return response.json();
}
