"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PopupProvider } from "@/contexts/PopupContext";
import { GenrePlaylistProvider } from "@/contexts/GenrePlaylistContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { TrackListSidebarVisibilityProvider } from "@/contexts/TrackListSidebarVisibilityContext";
import { TrackListProvider } from "@/contexts/TrackListContext";
import { SpotifyLibTracksProvider } from "@/contexts/SpotifyLibTracksContext";
import { ConnectivityErrorProvider } from "@/contexts/ConnectivityErrorContext";
import { SpotifyAuthProvider } from "@/contexts/SpotifyAuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { useEffect } from "react";
import { validateClientEnv } from "@/lib/public-env-validator";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  useEffect(() => {
    validateClientEnv();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ConnectivityErrorProvider>
          <SpotifyAuthProvider>
            <PopupProvider>
              <GenrePlaylistProvider>
                <PlayerProvider>
                  <TrackListProvider>
                    <SpotifyLibTracksProvider>
                      <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
                    </SpotifyLibTracksProvider>
                  </TrackListProvider>
                </PlayerProvider>
              </GenrePlaylistProvider>
            </PopupProvider>
          </SpotifyAuthProvider>
        </ConnectivityErrorProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
