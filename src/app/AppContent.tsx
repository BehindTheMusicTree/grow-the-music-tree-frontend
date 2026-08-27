"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePopup, useConnectivityErrorPopup } from "@behindthemusictree/app-kit/popup";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { TrackListSidebar, useTrackListSidebarVisibility } from "@behindthemusictree/app-kit/genre-tree";
import { initSentry } from "@lib/sentry";
import { isPrototypeRoute } from "@lib/prototype-mode";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

import AppHeader from "@components/features/menu/AppHeader";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";
import PrototypeModeBanner from "@components/features/banner/PrototypeModeBanner";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";

import { GenreTreeViewModeProvider } from "@contexts/GenreTreeViewModeProvider";

import { PLAYER_HEIGHT } from "@constants/layout";

export default function AppContent({ children }: { children: ReactNode }) {
  const { playerTrackObject } = usePlayer();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { activePopup } = usePopup();
  const pathname = usePathname();
  const isPrototype = isPrototypeRoute(pathname);

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

  const centerMaxHeight = `calc(100vh - ${PLAYER_HEIGHT}px)`;

  return (
    <GenreTreeViewModeProvider>
      <div className="app col h-screen">
        {isPrototype && <PrototypeModeBanner />}
        <AppHeader />

        <div className="center fixed top-0 flex h-full w-full bg-gray-100" style={{ maxHeight: centerMaxHeight }}>
          <div className="relative flex min-h-0 w-full flex-grow">
            <div className="min-h-0 flex-grow w-full flex" style={activePopup ? { filter: "blur(4px)" } : undefined}>
              <main className="flex min-h-0 w-full flex-grow flex-col mx-8 pt-20">
                <div className="flex min-h-0 flex-1 flex-col">{children}</div>
              </main>
              {isTrackListSidebarVisible && <TrackListSidebar className="z-40" />}
            </div>
            {activePopup && (
              <div className="absolute top-0 right-0 bottom-0 left-0 z-40 pointer-events-none bg-black/10" aria-hidden />
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div style={activePopup ? { filter: "blur(4px)" } : undefined}>
            <Player className="relative z-0" />
          </div>
          {activePopup && <div className="absolute inset-0 z-10 pointer-events-none bg-black/10" aria-hidden />}
        </div>
        <AutoAdvance />
        {activePopup}
      </div>
    </GenreTreeViewModeProvider>
  );
}
