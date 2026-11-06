"use client";

import { ReactNode, useCallback } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, useFetchWrapper, ConnectivityErrorProvider, Scope, PlaybackContextProvider, usePlaybackContext } from "@behindthemusictree/app-kit/transport";
import { SessionProvider } from "@behindthemusictree/app-kit/auth";
import { SessionProvider as AuthSessionProvider } from "next-auth/react";
import { TrackNounProvider } from "@behindthemusictree/app-kit/track-noun";
import { PopupProvider } from "@behindthemusictree/app-kit/popup";
import { PlayerProvider, PlayerTrack } from "@behindthemusictree/app-kit/player";
import {
  TrackListSidebarVisibilityProvider,
  TrackListProvider,
  libraryEndpoints,
  SongDetailedSchema,
} from "@behindthemusictree/app-kit/genre-tree";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { toPlayerTrack } from "@lib/player-track";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

// grow only plays tracks from the reference (community) tree; the "me"-scope playback paths
// (My Library, My Genre Playlists) are being removed from grow in favor of hear-the-music-tree.
const PLAYER_SCOPE = "reference" satisfies Scope;

function useLoadTrack(getBackendBaseUrl: () => string): (trackId: string) => Promise<PlayerTrack> {
  const { fetch } = useFetchWrapper(getBackendBaseUrl);
  const { refresh } = usePlaybackContext();

  return useCallback(
    async (trackId: string): Promise<PlayerTrack> => {
      await refresh();
      const response = await fetch(libraryEndpoints[PLAYER_SCOPE].songs.detail(trackId), true, false);
      if (!response) {
        throw new Error(`Failed to load track ${trackId}`);
      }
      return toPlayerTrack(SongDetailedSchema.parse(response));
    },
    [fetch, refresh],
  );
}

function PlaybackProviders({ children }: ProvidersProps) {
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  const loadContext = useCallback(() => fetch("playback/context/", true, false), [fetch]);
  return <PlaybackContextProvider loadContext={loadContext}><AppProviders>{children}</AppProviders></PlaybackContextProvider>;
}

function PlaybackContextError() {
  const { error, refresh } = usePlaybackContext();
  if (!error) return null;
  return (
    <div role="alert">
      Unable to check playback location.{' '}
      <button type="button" onClick={() => { void refresh(true).catch(() => {}); }}>Retry</button>
    </div>
  );
}

function AppProviders({ children }: ProvidersProps) {
  const loadTrack = useLoadTrack(getGrowBackendBaseUrl);

  return (
    <PlayerProvider loadTrack={loadTrack}>
      <PopupProvider>
        <TrackListSidebarVisibilityProvider>
          <TrackListProvider
            getBackendBaseUrl={getGrowBackendBaseUrl}
            schema={SongDetailedSchema}
          >
            <PlaybackContextError />
            {children}
          </TrackListProvider>
        </TrackListSidebarVisibilityProvider>
      </PopupProvider>
    </PlayerProvider>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthSessionProvider>
      <QueryClientProvider client={queryClient}>
        <ConnectivityErrorProvider>
          <SessionProvider>
            <TrackNounProvider singular="song" plural="songs">
              <PlaybackProviders>{children}</PlaybackProviders>
            </TrackNounProvider>
          </SessionProvider>
        </ConnectivityErrorProvider>
      </QueryClientProvider>
    </AuthSessionProvider>
  );
}
