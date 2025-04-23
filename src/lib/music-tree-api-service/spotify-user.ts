"use client";

import { AuthFetch } from "@/hooks/useAuthenticatedApi";

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
}

export async function retrieveSpotifyUser(authFetch: AuthFetch): Promise<SpotifyUser> {
  const response = await authFetch("user/spotify/");
  return response.json();
}
