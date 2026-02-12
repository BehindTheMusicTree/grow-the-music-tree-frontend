"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { usePopup } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import { useTrackList } from "@contexts/TrackListContext";
import { initSentry } from "@lib/sentry";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

import Banner from "@components/features/banner/Banner";
import Menu from "@components/features/menu/Menu";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";
import TrackListSidebar from "@components/features/track-list-sidebar/TrackListSidebar";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";
import SpotifyAuthPopup from "@components/ui/popup/child/SpotifyAuthPopup";

import { BANNER_HEIGHT, PLAYER_HEIGHT } from "@constants/layout";
import {
  ConnectivityError,
  NetworkError,
  AuthRequired,
  BackendError,
  BadRequestError,
  ClientError,
  ServiceError,
} from "@app-types/app-errors/app-error";

export default function AppContent({ children }: { children: ReactNode }) {
  const { playerUploadedTrackObject } = usePlayer();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { trackList } = useTrackList();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const { connectivityError, clearConnectivityError } = useConnectivityError();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const currentConnectivityErrorRef = useRef<typeof ConnectivityError | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("[AppContent] mounted on route", window.location.pathname);
    }
    initSentry();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]");
      if (!anchor) return;
      const href = (anchor as HTMLAnchorElement).getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      clearConnectivityError();
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [clearConnectivityError]);

  useEffect(() => {}, [playerUploadedTrackObject]);

  useEffect(() => {
    if (connectivityError === null) {
      if (currentConnectivityErrorRef.current !== null) {
        currentConnectivityErrorRef.current = null;
        hidePopup();
      }
    } else if (
      currentConnectivityErrorRef.current == null ||
      (![NetworkError, BackendError, ClientError, ServiceError].includes(currentConnectivityErrorRef.current) &&
        !(connectivityError instanceof currentConnectivityErrorRef.current))
    ) {
      let popup: ReactNode | null = null;
      const error = connectivityError as ConnectivityError;
      if (error instanceof AuthRequired) {
        popup = <SpotifyAuthPopup handleSpotifyOAuth={handleSpotifyOAuth} />;
      } else if (error instanceof BadRequestError || error instanceof BackendError || error instanceof ServiceError) {
        popup = <InternalErrorPopup errorCode={error.code} />;
      } else if (error instanceof NetworkError) {
        popup = (
          <NetworkErrorPopup title="Network Error">
            Please check your internet connection and try again.
          </NetworkErrorPopup>
        );
      }

      if (popup) {
        showPopup(popup);
      }

      currentConnectivityErrorRef.current = error.constructor as typeof ConnectivityError;
    }
  }, [connectivityError, showPopup, hidePopup, clearConnectivityError, handleSpotifyOAuth]);

  // Calculate dynamic heights based on player visibility
  const centerMaxHeight = {
    centerWithPlayer: `calc(100vh - ${BANNER_HEIGHT + PLAYER_HEIGHT}px)`,
    centerWithoutPlayer: `calc(100vh - ${BANNER_HEIGHT}px)`,
  };

  return (
    <div className="app col h-screen">
      <Banner className="banner fixed w-full top-0 z-50 h-banner" />

      <div
        className="center fixed top-banner bg-gray-100 h-full w-full flex"
        style={{
          maxHeight: playerUploadedTrackObject ? centerMaxHeight.centerWithPlayer : centerMaxHeight.centerWithoutPlayer,
        }}
      >
        <Menu className="menu left-0 z-40" />
        <div className="relative flex-grow w-full flex">
          <div
            className="flex-grow w-full flex"
            style={activePopup ? { filter: "blur(4px)" } : undefined}
          >
            <main className="flex-grow w-full mx-8">{children}</main>
            {isTrackListSidebarVisible && <TrackListSidebar className="z-40" />}
          </div>
          {activePopup && (
            <div
              className="absolute top-0 right-0 bottom-0 left-0 z-40 pointer-events-none bg-black/10"
              aria-hidden
            />
          )}
        </div>
      </div>

      {playerUploadedTrackObject && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div style={activePopup ? { filter: "blur(4px)" } : undefined}>
            <Player className="relative z-0" />
          </div>
          {activePopup && (
            <div className="absolute inset-0 z-10 pointer-events-none bg-black/10" aria-hidden />
          )}
        </div>
      )}
      <AutoAdvance />
      {activePopup}
    </div>
  );
}
