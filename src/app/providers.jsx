"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/contexts/AuthContext";
import { PopupProvider } from "@/contexts/PopupContext";
import { UploadedTrackProvider } from "@/contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@/contexts/GenrePlaylistContext";
import { PageProvider } from "@/contexts/PageContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@/contexts/TrackListSidebarVisibilityContext";
import { SpotifyLibraryProvider } from "@/contexts/SpotifyLibraryContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupProvider>
          <UploadedTrackProvider>
            <GenrePlaylistProvider>
              <PageProvider>
                <PlayerProvider>
                  <TrackListSidebarVisibilityProvider>
                    <SpotifyLibraryProvider>
                      <NotificationProvider>{children}</NotificationProvider>
                    </SpotifyLibraryProvider>
                  </TrackListSidebarVisibilityProvider>
                </PlayerProvider>
              </PageProvider>
            </GenrePlaylistProvider>
          </UploadedTrackProvider>
        </PopupProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
