"use client";

export async function listUploadedTracks(authFetch, page = 1, pageSize = 50) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  const response = await authFetch(`library/uploaded?${params.toString()}`);
  return response.json();
}

export async function uploadTrack(authFetch, trackData) {
  const response = await authFetch("library/uploaded/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}

export async function updateUploadedTrack(authFetch, trackId, trackData) {
  const response = await authFetch(`library/uploaded/${trackId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trackData),
  });
  return response.json();
}
