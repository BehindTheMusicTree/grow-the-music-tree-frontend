"use client";

import { signIn } from "next-auth/react";

export function useSpotifyAuth() {
  const handleSpotifyAuth = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID) {
        throw new Error("Spotify client ID is not configured. Please check your environment variables.");
      }

      if (!process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
        throw new Error("Spotify redirect URI is not configured. Please check your environment variables.");
      }

      await signIn("spotify", {
        callbackUrl: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
        clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      });
    } catch (error) {
      console.error("Failed to authenticate with Spotify:", error);
    }
  };

  return handleSpotifyAuth;
}
