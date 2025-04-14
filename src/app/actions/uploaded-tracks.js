"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { withAuthHandling } from "@lib/auth-error-handler";

async function listUploadedTracksImpl(session, page = 1, pageSize = 50) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch tracks");
  }

  return response.json();
}

export const getTracks = withAuthHandling(listUploadedTracksImpl);

async function uploadTrackImpl(formData) {
  const session = await getServerSession(authOptions);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  });
  return response.json();
}

async function updateUploadedTrackImpl(uploadedTrackUuid, uploadedTrackData) {
  const session = await getServerSession(authOptions);

  const transformedData = {
    ...uploadedTrackData,
    artistsNames: uploadedTrackData.artistName ? [uploadedTrackData.artistName] : uploadedTrackData.artistsNames,
    artistName: undefined,
    genre: uploadedTrackData.genre?.uuid || uploadedTrackData.genreName,
    genreName: undefined,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/${uploadedTrackUuid}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(transformedData),
  });
  return response.json();
}

export const listUploadedTracks = withAuthHandling(listUploadedTracksImpl);
export const uploadTrack = withAuthHandling(uploadTrackImpl);
export const updateUploadedTrack = withAuthHandling(updateUploadedTrackImpl);
