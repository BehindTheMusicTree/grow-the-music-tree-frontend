"use client";

import { ReactNode, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, useFetchWrapper, ConnectivityErrorProvider, Scope } from "@behindthemusictree/app-kit/transport";
import { SessionProvider } from "@behindthemusictree/app-kit/auth";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { PlayerProvider, PlayerTrack } from "@behindthemusictree/app-kit/player";
import {
  TrackListSidebarVisibilityProvider,
  TrackListProvider,
  libraryEndpoints,
  UploadedTrackDetailed,
} from "@behindthemusictree/app-kit/genre-tree";
import { getBackendBaseUrl } from "@lib/site-urls";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

// grow only plays tracks from the reference (community) tree; the "me"-scope playback paths
// (My Library, My Genre Playlists) are being removed from grow in favor of hear-the-music-tree.
const PLAYER_SCOPE: Scope = "reference";

function useLoadTrack(): (trackId: string) => Promise<PlayerTrack> {
  const { fetch } = useFetchWrapper(getBackendBaseUrl);

  return useCallback(
    async (trackId: string): Promise<PlayerTrack> => {
      const requiresAuth = PLAYER_SCOPE === "me";
      const track = await fetch<UploadedTrackDetailed>(
        libraryEndpoints[PLAYER_SCOPE].uploaded.detail(trackId),
        true,
        requiresAuth,
      );
      const data = await fetch<ArrayBuffer>(
        libraryEndpoints[PLAYER_SCOPE].uploaded.download(trackId),
        true,
        requiresAuth,
        {},
        {},
        true,
      );
      if (!track || !data) {
        throw new Error(`Failed to load track ${trackId}`);
      }
      const blob = new Blob([data], { type: "audio/mpeg" });
      return {
        id: trackId,
        streamUrl: URL.createObjectURL(blob),
        title: track.title,
        artists: track.artists?.map((artist) => ({ name: artist.name })),
      };
    },
    [fetch],
  );
}

function AppProviders({ children }: ProvidersProps) {
  const loadTrack = useLoadTrack();

  return (
    <PlayerProvider loadTrack={loadTrack}>
      <PopupProvider>
        <TrackListSidebarVisibilityProvider>
          <TrackListProvider getBackendBaseUrl={getBackendBaseUrl}>{children}</TrackListProvider>
        </TrackListSidebarVisibilityProvider>
      </PopupProvider>
    </PlayerProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ConnectivityErrorProvider>
          <AppProviders>{children}</AppProviders>
        </ConnectivityErrorProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
