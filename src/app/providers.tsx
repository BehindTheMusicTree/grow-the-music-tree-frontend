"use client";

import { ReactNode, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, useFetchWrapper, ConnectivityErrorProvider, Scope } from "@behindthemusictree/app-kit/transport";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { PlayerProvider, PlayerTrack } from "@behindthemusictree/app-kit/player";
import {
  TrackListSidebarVisibilityProvider,
  TrackListProvider,
  libraryEndpoints,
  YoutubeTrackDetailed,
} from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { toPlayerTrack } from "@lib/player-track";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

// grow only plays tracks from the reference (community) tree; the "me"-scope playback paths
// (My Library, My Genre Playlists) are being removed from grow in favor of hear-the-music-tree.
const PLAYER_SCOPE: Scope = "reference";

function useLoadTrack(): (trackId: string) => Promise<PlayerTrack> {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);

  return useCallback(
    async (trackId: string): Promise<PlayerTrack> => {
      const track = await fetch<YoutubeTrackDetailed>(
        libraryEndpoints[PLAYER_SCOPE].youtube.detail(trackId),
        true,
        false,
      );
      if (!track) {
        throw new Error(`Failed to load track ${trackId}`);
      }
      return toPlayerTrack(track);
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
          <TrackListProvider getBackendBaseUrl={getGrowBackendBaseUrl}>{children}</TrackListProvider>
        </TrackListSidebarVisibilityProvider>
      </PopupProvider>
    </PlayerProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectivityErrorProvider>
        <AppProviders>{children}</AppProviders>
      </ConnectivityErrorProvider>
    </QueryClientProvider>
  );
}
