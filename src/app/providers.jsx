"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PopupProvider } from "@/contexts/PopupContext";
import { UploadedTrackProvider } from "@/contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@/contexts/GenrePlaylistContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@/contexts/TrackListSidebarVisibilityContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PopupProvider>
        <UploadedTrackProvider>
          <GenrePlaylistProvider>
            <PlayerProvider>
              <TrackListSidebarVisibilityProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </TrackListSidebarVisibilityProvider>
            </PlayerProvider>
          </GenrePlaylistProvider>
        </UploadedTrackProvider>
      </PopupProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
