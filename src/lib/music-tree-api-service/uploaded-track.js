"use client";

export async function listUploadedTracks(authFetch, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`library/uploaded-tracks/?${params.toString()}`);
  return response.json();
}

export async function uploadTrack(trackData) {
  const response = await fetch("library/uploaded-tracks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

export async function updateUploadedTrack(trackId, trackData) {
  const response = await fetch(`library/uploaded-tracks/${trackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}
