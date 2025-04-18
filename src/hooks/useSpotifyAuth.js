"use client";

import { signIn } from "next-auth/react";

export function useSpotifyAuth() {
  const handleSpotifyAuth = async () => {
    try {
      await signIn("spotify", { callbackUrl: window.location.href });
    } catch (error) {
      console.error("Failed to authenticate with Spotify:", error);
    }
  };

  return handleSpotifyAuth;
}
