"use client";

import { usePopup } from "@contexts/PopupContext";
import { signIn } from "next-auth/react";

export function useSpotifyAuth() {
  const { showPopup, hidePopup } = usePopup();

  const showAuthPopup = (callbackUrl = "/") => {
    showPopup("spotifyAuth", {
      message: "Connect your Spotify account to access all features",
      onAuthenticate: () => {
        hidePopup();
        signIn("spotify", { callbackUrl });
      },
    });
  };

  return { showAuthPopup };
}
