"use client";

import { useEffect, ReactNode } from "react";
import { usePopup, useConnectivityErrorPopup } from "@behindthemusictree/app-kit/popup";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { initSentry } from "@lib/sentry";
import { cn } from "@lib/utils";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

import SideRail from "@components/features/menu/SideRail";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";

import { PlayerPanelProvider } from "@contexts/PlayerPanelProvider";
import { GenreTreeViewModeProvider } from "@contexts/GenreTreeViewModeProvider";

export default function AppContent({ children }: { children: ReactNode }) {
  const { playerTrackObject } = usePlayer();
  const { activePopup } = usePopup();

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {}, [playerTrackObject]);

  useConnectivityErrorPopup({
    isAccountPage: false,
    routeRequiresAuth: false,
    routeRequiresSpotify: false,
    renderers: {
      renderAuthPopup: () => null,
      renderSpotifyOnlyAuthPopup: () => null,
      renderInternalErrorPopup: (errorCode) => <InternalErrorPopup errorCode={errorCode} />,
      renderSpotifyAuthErrorPopup: () => null,
      renderGoogleAuthErrorPopup: () => null,
      renderNetworkErrorPopup: () => <NetworkErrorPopup />,
    },
  });

  return (
    <PlayerPanelProvider>
    <GenreTreeViewModeProvider>
      <div className="app col h-screen">
        <div className="center fixed top-0 flex h-full w-full">
          <div
            className={cn(
              "relative flex min-h-0 w-full flex-grow flex-col-reverse md:flex-row",
              activePopup && "pointer-events-none blur-sm",
            )}
          >
            <SideRail />
            <div className="flex min-h-0 w-full flex-grow">
              <main className="flex min-h-0 w-full flex-grow flex-col">
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              </main>
            </div>
            {activePopup && (
              <div className="absolute top-0 right-0 bottom-0 left-0 z-40 pointer-events-none bg-black/10" aria-hidden />
            )}
          </div>
        </div>

        <Player className={activePopup ? "blur-sm pointer-events-none" : undefined} />
        <AutoAdvance />
        {activePopup}
      </div>
    </GenreTreeViewModeProvider>
    </PlayerPanelProvider>
  );
}
