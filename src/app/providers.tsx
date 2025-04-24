"use client";

import { ReactNode } from "react";
import { SessionProvider } from "@/contexts/SessionContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { PopupProvider } from "@/contexts/PopupContext";
import { AppErrorProvider } from "@/contexts/ConnectivityErrorContext";
import { TrackListSidebarVisibilityProvider } from "@/contexts/TrackListSidebarVisibilityContext";

interface ProvidersProps {
  children: NonNullable<ReactNode>;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PlayerProvider>
        <PopupProvider>
          <AppErrorProvider>
            <TrackListSidebarVisibilityProvider>{children}</TrackListSidebarVisibilityProvider>
          </AppErrorProvider>
        </PopupProvider>
      </PlayerProvider>
    </SessionProvider>
  );
}
