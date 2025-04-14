"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { withAuthProtection } from "@lib/server/auth-api";
import { getPublicEnvVar } from "@lib/config";

async function listManualPlaylistsImpl(authFetch, page = 1, pageSize = 50) {
  const response = await authFetch(
    `${getPublicEnvVar("API_BASE_URL")}manual-playlists/?page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch genre playlists");
  }

  return response.json();
}

async function createManualPlaylistImpl(playlistData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}manual-playlists/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(playlistData),
  });

  if (!response.ok) {
    throw new Error("Failed to create manual playlist");
  }

  return response.json();
}

export const listManualPlaylists = withAuthProtection(listManualPlaylistsImpl);
export const createManualPlaylist = withAuthProtection(createManualPlaylistImpl);
