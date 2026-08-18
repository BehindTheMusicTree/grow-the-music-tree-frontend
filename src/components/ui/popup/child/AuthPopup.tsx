"use client";

import { ComponentProps } from "react";
import { AuthPopup as AppKitAuthPopup } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type AuthPopupProps = Omit<
  ComponentProps<typeof AppKitAuthPopup>,
  "topOffset" | "spotifyOnlyDescription" | "defaultDescription"
>;

const spotifyOnlyDescription = (
  <>
    <b>My Spotify Library</b> requires Spotify to access your saved tracks and playlists.
  </>
);

const defaultDescription = (
  <>
    <b>Music Tree</b> requires sign-in to browse your library and explore new horizons
  </>
);

export default function AuthPopup(props: AuthPopupProps) {
  return (
    <AppKitAuthPopup
      {...props}
      topOffset={BANNER_HEIGHT}
      spotifyOnlyDescription={spotifyOnlyDescription}
      defaultDescription={defaultDescription}
    />
  );
}
