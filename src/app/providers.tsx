"use client";

import { ReactNode } from "react";
import { SessionProvider } from "@contexts/SessionContext";
import { PlayerProvider } from "@contexts/PlayerContext";
import { PopupProvider } from "@contexts/PopupContext";
import { ConnectivityErrorProvider } from "@contexts/ConnectivityErrorContext";
import { TrackListSidebarVisibilityProvider } from "@contexts/TrackListSidebarVisibilityContext";
import { TrackListProvider } from "@contexts/TrackListContext";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PlayerProvider>
        <PopupProvider>
          <ConnectivityErrorProvider>
            <TrackListSidebarVisibilityProvider>
              <TrackListProvider>{children}</TrackListProvider>
            </TrackListSidebarVisibilityProvider>
          </ConnectivityErrorProvider>
        </PopupProvider>
      </PlayerProvider>
    </SessionProvider>
  );
}
