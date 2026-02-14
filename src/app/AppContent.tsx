"use client";

import { useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { usePopup } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
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
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

export default function AppContent({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { playerUploadedTrackObject } = usePlayer();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const { connectivityError, clearConnectivityError } = useConnectivityError();
  const { handleSpotifyOAuth, authToBackendFromSpotifyCode } = useSpotifyAuth();
  const currentConnectivityErrorRef = useRef<typeof ConnectivityError | null>(null);
  const spotifyAuthHandledRef = useRef(false);

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (spotifyAuthHandledRef.current) return;
    if (!window.location.pathname.startsWith("/auth/spotify/callback")) return;

    spotifyAuthHandledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const errorParam = params.get("error");

    (async () => {
      if (errorParam) {
        return;
      }

      if (!code) {
        return;
      }

      try {
        const redirectUrl = await authToBackendFromSpotifyCode(code);
        if (redirectUrl) {
          router.push(redirectUrl);
        }
      } catch (e) {}
    })().catch((e) => {});
  }, [authToBackendFromSpotifyCode, router]);

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
      if (
        error instanceof AuthRequired ||
        (error instanceof BackendError && error.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED)
      ) {
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
          <div className="flex-grow w-full flex" style={activePopup ? { filter: "blur(4px)" } : undefined}>
            <main className="flex-grow w-full mx-8">{children}</main>
            {isTrackListSidebarVisible && <TrackListSidebar className="z-40" />}
          </div>
          {activePopup && (
            <div className="absolute top-0 right-0 bottom-0 left-0 z-40 pointer-events-none bg-black/10" aria-hidden />
          )}
        </div>
      </div>

      {playerUploadedTrackObject && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div style={activePopup ? { filter: "blur(4px)" } : undefined}>
            <Player className="relative z-0" />
          </div>
          {activePopup && <div className="absolute inset-0 z-10 pointer-events-none bg-black/10" aria-hidden />}
        </div>
      )}
      <AutoAdvance />
      {activePopup}
    </div>
  );
}
