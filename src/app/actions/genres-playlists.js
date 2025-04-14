"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { withAuthHandling } from "@lib/auth-error-handler";

async function listGenrePlaylistsImpl(page = 1, pageSize = 50) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/?page=${page}&pageSize=${pageSize}`,
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

export const listGenrePlaylists = withAuthHandling(listGenrePlaylistsImpl);
