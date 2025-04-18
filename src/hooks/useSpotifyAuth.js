"use client";

import { signIn } from "next-auth/react";

export function useSpotifyAuth() {
  const handleSpotifyAuth = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI) {
        throw new Error("Spotify configuration is missing. Please check your environment variables.");
      }

      await signIn("spotify", {
        clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        callbackUrl: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      });
    } catch (error) {
      console.error("Failed to authenticate with Spotify:", error);
    }
  };

  return handleSpotifyAuth;
}
