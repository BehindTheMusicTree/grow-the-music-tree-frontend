"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { usePopup, AUTH_POPUP_TYPE, useConnectivityErrorPopup } from "@behindthemusictree/app-kit/popup";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { TrackListSidebar, useTrackListSidebarVisibility } from "@behindthemusictree/app-kit/genre-tree";
import { initSentry } from "@lib/sentry";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";
import SpotifyAuthErrorPopup from "@components/ui/popup/child/SpotifyAuthErrorPopup";
import AuthErrorPopup from "@components/ui/popup/child/AuthErrorPopup";

import AppHeader from "@components/features/menu/AppHeader";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";
import AuthPopup from "@components/ui/popup/child/AuthPopup";
import AuthCallbackHandler from "@components/auth/AuthCallbackHandler";

import { BANNER_HEIGHT, PLAYER_HEIGHT } from "@constants/layout";
import { getRouteAuthRequirement } from "@lib/constants/routes";
import { getBackendBaseUrl } from "@lib/site-urls";

export default function AppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { playerTrackObject } = usePlayer();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { activePopup } = usePopup();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const { handleGoogleOAuth } = useGoogleAuth();
  const isAccountPage = pathname === "/account";
  const routeAuthRequirement = getRouteAuthRequirement(pathname);
  const routeRequiresAuth = routeAuthRequirement === "any" || routeAuthRequirement === "spotify";
  const routeRequiresSpotify = routeAuthRequirement === "spotify";

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {}, [playerTrackObject]);

  useConnectivityErrorPopup({
    isAccountPage,
    routeRequiresAuth,
    routeRequiresSpotify,
    renderers: {
      renderAuthPopup: () => (
        <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} handleGoogleOAuth={handleGoogleOAuth} />
      ),
      renderSpotifyOnlyAuthPopup: () => <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} spotifyOnly />,
      renderInternalErrorPopup: (errorCode) => <InternalErrorPopup errorCode={errorCode} />,
      renderSpotifyAuthErrorPopup: ({ message, onClose }) => (
        <SpotifyAuthErrorPopup message={message} onClose={onClose} />
      ),
      renderGoogleAuthErrorPopup: ({ message, onClose }) => <AuthErrorPopup message={message} onClose={onClose} />,
      renderNetworkErrorPopup: () => <NetworkErrorPopup />,
    },
  });

  const centerMaxHeight = `calc(100vh - ${BANNER_HEIGHT + PLAYER_HEIGHT}px)`;

  return (
    <div className="app col h-screen">
      <AuthCallbackHandler />
      <AppHeader />

      <div
        className="center fixed top-banner flex h-full w-full bg-gray-100"
        style={{ maxHeight: centerMaxHeight }}
      >
        <div className="relative flex min-h-0 w-full flex-grow">
          <div className="min-h-0 flex-grow w-full flex" style={activePopup ? { filter: "blur(4px)" } : undefined}>
            <main className="flex min-h-0 w-full flex-grow flex-col mx-8">
              <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            </main>
            {isTrackListSidebarVisible && (
              <TrackListSidebar className="z-40" getBackendBaseUrl={getBackendBaseUrl} />
            )}
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
  );
}
