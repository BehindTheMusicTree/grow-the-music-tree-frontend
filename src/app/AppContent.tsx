"use client";

import { useEffect, ReactNode } from "react";
import { usePopup, useConnectivityErrorPopup } from "@behindthemusictree/app-kit/popup";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { initSentry } from "@lib/sentry";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

import AppHeader from "@components/features/menu/AppHeader";
import AppSubheader from "@components/features/menu/AppSubheader";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";

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
    <GenreTreeViewModeProvider>
      <div className="app col h-screen">
        <AppHeader />
        <AppSubheader />

        <div className="center fixed top-0 flex h-full w-full bg-gray-100">
          <div className="relative flex min-h-0 w-full flex-grow">
            <div className="min-h-0 flex-grow w-full flex" style={activePopup ? { filter: "blur(4px)" } : undefined}>
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
  );
}
