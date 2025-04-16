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
import { ConnectivityErrorProvider } from "@contexts/ConnectivityErrorContext";
import { useEffect } from "react";
import { validateClientEnv } from "@lib/env-validator";

const queryClient = new QueryClient();

export default function Providers({ children }) {
  // Validate client environment variables on component mount
  useEffect(() => {
    try {
      validateClientEnv();
      console.log("✅ Client environment variables validated successfully");
    } catch (error) {
      console.error("❌ Client environment validation failed:", error.message);
      // We don't throw here to prevent the app from crashing,
      // but the error will be visible in the console
      // The ConnectivityErrorProvider can be used to display a user-friendly error
    }
  }, []);
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PopupProvider>
          <ConnectivityErrorProvider>
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
          </ConnectivityErrorProvider>
        </PopupProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
