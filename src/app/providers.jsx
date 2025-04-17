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
  // Inject environment variables from server to client and validate them
  useEffect(() => {
    // Create fallback mechanism for client-side environment variables
    if (typeof window !== "undefined") {
      // Define the variables we need to make available to the client
      const clientEnvVars = {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
        NEXT_PUBLIC_SPOTIFY_SCOPE: process.env.NEXT_PUBLIC_SPOTIFY_SCOPE,
        NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI,
      };

      // Create a global __NEXT_ENV object to store environment variables
      window.__NEXT_ENV = window.__NEXT_ENV || {};

      // Inject each environment variable if it's not already defined
      Object.entries(clientEnvVars).forEach(([key, value]) => {
        if (value) {
          // Set on window.__NEXT_ENV for our custom validator
          window.__NEXT_ENV[key] = value;

          // Also set directly on window for easier access
          window[key] = value;
        }
      });
    }

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
