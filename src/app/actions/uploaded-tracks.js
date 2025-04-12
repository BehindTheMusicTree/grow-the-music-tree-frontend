"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function uploadTrack(formData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  });
  return response.json();
}

export async function updateUploadedTrack(uploadedTrackUuid, uploadedTrackData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

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
