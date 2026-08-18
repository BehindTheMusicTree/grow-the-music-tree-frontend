"use client";

import { ComponentProps } from "react";
import { SpotifyAuthErrorPopup as AppKitSpotifyAuthErrorPopup } from "@behindthemusictree/app-kit/popup";
import { BANNER_HEIGHT } from "@lib/constants/layout";

type SpotifyAuthErrorPopupProps = Omit<
  ComponentProps<typeof AppKitSpotifyAuthErrorPopup>,
  "topOffset" | "contactEmail"
>;

export default function SpotifyAuthErrorPopup(props: SpotifyAuthErrorPopupProps) {
  return (
    <AppKitSpotifyAuthErrorPopup
      {...props}
      topOffset={BANNER_HEIGHT}
      contactEmail={process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? null}
    />
  );
}
