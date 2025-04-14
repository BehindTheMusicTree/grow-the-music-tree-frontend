"use server";

import { withAuthProtection } from "@lib/server/auth-api";

// List tracks with authFetch
async function listUploadedTracksImpl(session, authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`
  );

  return response.json();
}

// Upload track with authFetch
async function uploadTrackImpl(session, authFetch, formData) {
  const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

// Update track with authFetch
async function updateUploadedTrackImpl(session, authFetch, uploadedTrackUuid, uploadedTrackData) {
  const transformedData = {
    ...uploadedTrackData,
    artistsNames: uploadedTrackData.artistName ? [uploadedTrackData.artistName] : uploadedTrackData.artistsNames,
    artistName: undefined,
    genre: uploadedTrackData.genre?.uuid || uploadedTrackData.genreName,
    genreName: undefined,
  };

  const response = await authFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/${uploadedTrackUuid}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transformedData),
  });

  return response.json();
}

// Export all protected versions
export const getTracks = withAuthProtection(listUploadedTracksImpl);
export const listUploadedTracks = withAuthProtection(listUploadedTracksImpl);
export const uploadTrack = withAuthProtection(uploadTrackImpl);
export const updateUploadedTrack = withAuthProtection(updateUploadedTrackImpl);
