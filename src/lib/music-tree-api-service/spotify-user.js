"use client";

export async function retrieveSpotifyUser() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}user/spotify/`, {
    method: "GET",
  });

  return response;
}
