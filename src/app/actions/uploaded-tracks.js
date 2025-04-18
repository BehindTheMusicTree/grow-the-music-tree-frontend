"use server";

import { withAuthProtection } from "@lib/auth/auth-api";

// List tracks with authFetch
async function listUploadedTracksImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(`library/uploaded/?page=${page}&pageSize=${pageSize}`);
  return response.json();
}

// Upload track with authFetch
async function uploadTrackImpl(authFetch, formData) {
  const response = await authFetch("library/uploaded/", {
    method: "POST",
    body: formData,
  });

  return response.json();
}

// Update track with authFetch
async function updateUploadedTrackImpl(authFetch, uploadedTrackUuid, uploadedTrackData) {
  const transformedData = {
    ...uploadedTrackData,
    artistsNames: uploadedTrackData.artistName ? [uploadedTrackData.artistName] : uploadedTrackData.artistsNames,
    artistName: undefined,
    genre: uploadedTrackData.genre?.uuid || uploadedTrackData.genreName,
    genreName: undefined,
  };

  const response = await authFetch(`library/uploaded/${uploadedTrackUuid}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transformedData),
  });

  return response.json();
}

export const listUploadedTracks = withAuthProtection(listUploadedTracksImpl);
export const uploadTrack = withAuthProtection(uploadTrackImpl);
export const updateUploadedTrack = withAuthProtection(updateUploadedTrackImpl);
