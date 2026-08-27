"use client";

import { ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, useFetchWrapper, ConnectivityErrorProvider, Scope } from "@behindthemusictree/app-kit/transport";
import { SessionProvider } from "@behindthemusictree/app-kit/auth";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { PlayerProvider, PlayerTrack } from "@behindthemusictree/app-kit/player";
import {
  TrackListSidebarVisibilityProvider,
  TrackListProvider,
  libraryEndpoints,
  libraryQueryKeys,
  YoutubeTrackDetailed,
  YoutubeTrackDetailedSchema,
} from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl, getGrowPrototypeBackendBaseUrl } from "@lib/site-urls";
import { isPrototypeRoute } from "@lib/prototype-mode";
import { toPlayerTrack } from "@lib/player-track";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

// grow only plays tracks from the reference (community) tree; the "me"-scope playback paths
// (My Library, My Genre Playlists) are being removed from grow in favor of hear-the-music-tree.
const PLAYER_SCOPE = "reference" satisfies Scope;

function useLoadTrack(getBackendBaseUrl: () => string): (trackId: string) => Promise<PlayerTrack> {
  const { fetch } = useFetchWrapper(getBackendBaseUrl);

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
  const pathname = usePathname();
  const getBackendBaseUrl = isPrototypeRoute(pathname) ? getGrowPrototypeBackendBaseUrl : getGrowBackendBaseUrl;
  const loadTrack = useLoadTrack(getBackendBaseUrl);

  return (
    <PlayerProvider loadTrack={loadTrack}>
      <PopupProvider>
        <TrackListSidebarVisibilityProvider>
          <TrackListProvider
            getBackendBaseUrl={getBackendBaseUrl}
            schema={YoutubeTrackDetailedSchema}
            listEndpoint={() => libraryEndpoints[PLAYER_SCOPE].youtube.list()}
            listQueryKey={(page) => libraryQueryKeys[PLAYER_SCOPE].youtube.list(page)}
          >
            {children}
          </TrackListProvider>
        </TrackListSidebarVisibilityProvider>
      </PopupProvider>
    </PlayerProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConnectivityErrorProvider>
        <SessionProvider>
          <AppProviders>{children}</AppProviders>
        </SessionProvider>
      </ConnectivityErrorProvider>
    </QueryClientProvider>
  );
}
