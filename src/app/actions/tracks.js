"use server";

export async function uploadTrack(formData) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}library/uploaded/`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function updateUploadedTrack(uploadedTrackUuid, uploadedTrackData) {
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
    },
    body: JSON.stringify(transformedData),
  });
  return response.json();
}
