"use client";

import { ReactNode } from "react";
import { SessionProvider } from "@contexts/SessionContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { PopupProvider } from "@contexts/PopupContext";
import { ConnectivityErrorProvider } from "@contexts/ConnectivityErrorContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { TrackListProvider } from "@contexts/TrackListContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@lib/query-client";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ConnectivityErrorProvider>
          <PlayerProvider>
            <PopupProvider>
              <TrackListSidebarVisibilityProvider>
                <TrackListProvider>{children}</TrackListProvider>
              </TrackListSidebarVisibilityProvider>
            </PopupProvider>
          </PlayerProvider>
        </ConnectivityErrorProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
