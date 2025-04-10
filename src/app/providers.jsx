"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PopupProvider } from "@/app/contexts/PopupContext";
import { UploadedTrackProvider } from "@/app/contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@/contexts/GenrePlaylistContext";
import { PlayerProvider } from "@/app/contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@/app/contexts/TrackListSidebarVisibilityContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PopupProvider>
        <UploadedTrackProvider>
          <GenrePlaylistProvider>
            <PlayerProvider>
              <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
            </PlayerProvider>
          </GenrePlaylistProvider>
        </UploadedTrackProvider>
      </PopupProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
