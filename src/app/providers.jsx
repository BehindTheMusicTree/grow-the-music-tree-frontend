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
import { SpotifyLibraryProvider } from "@contexts/SpotifyLibraryContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PopupProvider>
          <UploadedTrackProvider>
            <GenrePlaylistProvider>
              <PlayerProvider>
                <TrackListProvider>
                  <SpotifyLibraryProvider>
                    <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
                  </SpotifyLibraryProvider>
                </TrackListProvider>
              </PlayerProvider>
            </GenrePlaylistProvider>
          </UploadedTrackProvider>
        </PopupProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
