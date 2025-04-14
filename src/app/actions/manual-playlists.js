"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { withAuthHandling } from "@lib/auth-error-handler";

async function listManualPlaylistsImpl(page = 1, pageSize = 50) {
  const session = await getServerSession(authOptions);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}manual-playlists/?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
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

export const listManualPlaylists = withAuthHandling(listManualPlaylistsImpl);
export const createManualPlaylist = withAuthHandling(createManualPlaylistImpl);
