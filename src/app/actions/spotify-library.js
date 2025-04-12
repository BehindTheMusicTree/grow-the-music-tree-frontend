"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function getSpotifyLibraryTracks(page = 1, pageSize = 50) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  
  // Direct API call without going through our own API route
  const response = await fetch(`${process.env.API_BASE_URL}library/uploaded/?page=${page}&pageSize=${pageSize}`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch library tracks from Spotify");
  }
  
  return response.json();
}