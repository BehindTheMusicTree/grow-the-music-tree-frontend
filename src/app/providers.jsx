"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PopupProvider } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { TrackListProvider } from "@contexts/TrackListContext";
import { SpotifyLibTracksProvider } from "@contexts/SpotifyLibTracksContext";
import { ConnectivityErrorProvider } from "@contexts/ConnectivityErrorContext";
import { SpotifyAuthProvider } from "@contexts/SpotifyAuthContext";
import { SessionProvider } from "@contexts/SessionContext";
import { useEffect } from "react";
import { validateClientEnv } from "@lib/public-env-validator";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  useEffect(() => {
    validateClientEnv();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <PopupProvider>
          <ConnectivityErrorProvider>
            <UploadedTrackProvider>
              <GenrePlaylistProvider>
                <PlayerProvider>
                  <TrackListProvider>
                    <SpotifyAuthProvider>
                      <SpotifyLibTracksProvider>
                        <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
                      </SpotifyLibTracksProvider>
                    </SpotifyAuthProvider>
                  </TrackListProvider>
                </PlayerProvider>
              </GenrePlaylistProvider>
            </UploadedTrackProvider>
          </ConnectivityErrorProvider>
        </PopupProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
