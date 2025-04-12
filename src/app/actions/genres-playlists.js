"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";

export async function getGenrePlaylists(page = 1, pageSize = 50) {
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

export async function createGenrePlaylist(genreData) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}genre-playlists/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(genreData),
  });

  if (!response.ok) {
    throw new Error("Failed to create genre playlist");
  }

  return response.json();
}
