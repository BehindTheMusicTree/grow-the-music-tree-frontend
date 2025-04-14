"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SessionProvider } from "next-auth/react";
import { PopupProvider } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { TrackListProvider } from "@contexts/TrackListContext";
import { SpotifyLibTracksProvider } from "@contexts/SpotifyLibTracksContext";
import { ErrorProvider } from "@contexts/ErrorContext";
import { setupFetchInterceptor } from "@lib/fetch/fetchInterceptor";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PopupProvider>
          <ErrorProvider>
            <UploadedTrackProvider>
              <GenrePlaylistProvider>
                <PlayerProvider>
                  <TrackListProvider>
                    <SpotifyLibTracksProvider>
                      <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
                    </SpotifyLibTracksProvider>
                  </TrackListProvider>
                </PlayerProvider>
              </GenrePlaylistProvider>
            </UploadedTrackProvider>
          </ErrorProvider>
        </PopupProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
