"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PopupProvider } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { AuthProvider } from "@contexts/AuthContext";
import { TrackListProvider } from "@contexts/TrackListContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupProvider>
          <UploadedTrackProvider>
            <GenrePlaylistProvider>
              <PlayerProvider>
                <TrackListProvider>
                  <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
                </TrackListProvider>
              </PlayerProvider>
            </GenrePlaylistProvider>
          </UploadedTrackProvider>
        </PopupProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
