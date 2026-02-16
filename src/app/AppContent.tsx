"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSpotifyAuth } from "@hooks/useSpotifyAuth";
import { useGoogleAuth } from "@hooks/useGoogleAuth";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { usePopup } from "@contexts/PopupContext";
import { AUTH_POPUP_TYPE } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import { initSentry } from "@lib/sentry";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";
import SpotifyAuthErrorPopup from "@components/ui/popup/child/SpotifyAuthErrorPopup";
import AuthErrorPopup from "@components/ui/popup/child/AuthErrorPopup";

import Banner from "@components/features/banner/Banner";
import Menu from "@components/features/menu/Menu";
import Player from "@components/features/player/Player";
import AutoAdvance from "@components/features/player/AutoAdvance";
import TrackListSidebar from "@components/features/track-list-sidebar/TrackListSidebar";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";
import AuthPopup from "@components/ui/popup/child/AuthPopup";

import { BANNER_HEIGHT, PLAYER_HEIGHT } from "@constants/layout";
import {
  ConnectivityError,
  NetworkError,
  AuthRequired,
  BackendError,
  BadRequestError,
  ClientError,
  ServiceError,
  InvalidInputError,
} from "@app-types/app-errors/app-error";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";
import { getRouteAuthRequirement } from "@lib/constants/routes";

export default function AppContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { playerUploadedTrackObject } = usePlayer();
  const { isTrackListSidebarVisible } = useTrackListSidebarVisibility();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const { connectivityError, clearConnectivityError } = useConnectivityError();
  const { handleSpotifyOAuth } = useSpotifyAuth();
  const { handleGoogleOAuth } = useGoogleAuth();
  const currentConnectivityErrorRef = useRef<typeof ConnectivityError | null>(null);
  const isAccountPage = pathname === "/account";
  const routeAuthRequirement = getRouteAuthRequirement(pathname);
  const routeRequiresAuth = routeAuthRequirement === "any" || routeAuthRequirement === "spotify";
  const routeRequiresSpotify = routeAuthRequirement === "spotify";

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {}, [playerUploadedTrackObject]);

  useEffect(() => {
    if (connectivityError === null) {
      if (currentConnectivityErrorRef.current !== null) {
        currentConnectivityErrorRef.current = null;
        hidePopup();
      }
    } else if (
      currentConnectivityErrorRef.current == null ||
      (![NetworkError, BackendError, ClientError, ServiceError, InvalidInputError].includes(
        currentConnectivityErrorRef.current,
      ) && !(connectivityError instanceof currentConnectivityErrorRef.current))
    ) {
      let popup: ReactNode | null = null;
      let popupType: string | null = null;
      const error = connectivityError as ConnectivityError;
      if (
        !isAccountPage &&
        routeRequiresAuth &&
        error instanceof AuthRequired
      ) {
        popup = (
          <AuthPopup
            handleSpotifyOAuth={handleSpotifyOAuth}
            handleGoogleOAuth={handleGoogleOAuth}
          />
        );
        popupType = AUTH_POPUP_TYPE;
      } else if (
        !isAccountPage &&
        routeRequiresSpotify &&
        error instanceof BackendError &&
        error.code === ErrorCode.BACKEND_SPOTIFY_AUTHORIZATION_REQUIRED
      ) {
        popup = <AuthPopup handleSpotifyOAuth={handleSpotifyOAuth} spotifyOnly />;
        popupType = AUTH_POPUP_TYPE;
      } else if (error instanceof InvalidInputError) {
        console.error("[InvalidInputError]", error.code, error.json);
        popup = <InternalErrorPopup errorCode={error.code} />;
      } else if (
        error instanceof BackendError &&
        [
          ErrorCode.BACKEND_SPOTIFY_USER_NOT_IN_ALLOWLIST,
          ErrorCode.BACKEND_SPOTIFY_AUTHENTICATION_ERROR,
        ].includes(error.code)
      ) {
        popup = (
          <SpotifyAuthErrorPopup
            message={error.message}
            errorCode={error.code}
            onClose={() => {
              hidePopup();
            }}
          />
        );
      } else if (
        error instanceof BackendError &&
        [
          ErrorCode.BACKEND_GOOGLE_AUTHENTICATION_ERROR,
          ErrorCode.BACKEND_GOOGLE_OAUTH_MISCONFIGURED,
          ErrorCode.BACKEND_GOOGLE_OAUTH_CODE_INVALID_OR_EXPIRED,
        ].includes(error.code)
      ) {
        popup = (
          <AuthErrorPopup
            message={error.message}
            onClose={() => {
              hidePopup();
            }}
          />
        );
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
        showPopup(popup, popupType);
      }

      currentConnectivityErrorRef.current = error.constructor as typeof ConnectivityError;
    }
  }, [connectivityError, showPopup, hidePopup, clearConnectivityError, handleSpotifyOAuth, handleGoogleOAuth, isAccountPage, routeRequiresAuth, routeRequiresSpotify]);

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
        <div className="relative min-h-0 flex-grow w-full flex">
          <div
            className="min-h-0 flex-grow w-full flex"
            style={activePopup ? { filter: "blur(4px)" } : undefined}
          >
            <main className="min-h-0 flex-grow w-full mx-8 overflow-y-auto">{children}</main>
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
