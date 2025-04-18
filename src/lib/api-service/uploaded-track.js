"use client";

export async function listUploadedTracks(page = 1, pageSize = 50) {
  const response = await fetch(`library/uploaded-tracks/?page=${page}&pageSize=${pageSize}`);
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
