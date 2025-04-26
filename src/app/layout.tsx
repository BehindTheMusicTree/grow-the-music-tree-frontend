"use client";

import { useEffect, useRef, ReactNode } from "react";
import { initSentry } from "@lib/sentry";
import "./globals.css";
import { Inter } from "next/font/google";

import Providers from "@app/providers";
import { PopupProvider } from "@contexts/PopupContext";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { usePopup } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import {
  ConnectivityError,
  NetworkError,
  AuthError,
  ServerError,
  BadRequestError,
} from "@app-types/app-errors/app-error";

import Banner from "@components/features/banner/Banner";
import Menu from "@components/features/menu/Menu";
import Player from "@components/features/player/Player";
import TrackListSidebar from "@components/features/track-list-sidebar/TrackListSidebar";
import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";
import SpotifyAuthPopup from "@components/ui/popup/child/SpotifyAuthPopup";
import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";
import { setupFetchInterceptor } from "@lib/fetch-interceptor";
import { BANNER_HEIGHT, PLAYER_HEIGHT } from "@constants/layout";
initSentry();

const inter = Inter({ subsets: ["latin"] });

function AppContent({ children }: { children: ReactNode }) {
  const { playerUploadedTrackObject } = usePlayer();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const isTrackListSidebarVisible = useTrackListSidebarVisibility();
  const { connectivityError, setConnectivityError, clearConnectivityError } = useConnectivityError();
  const currentConnectivityErrorTypeRef = useRef<typeof ConnectivityError | null>(null);

  useEffect(() => {
    const cleanup = setupFetchInterceptor((error) => {
      // Handle errors globally here
      console.error("Global fetch error:", error);
      if (error instanceof ConnectivityError) {
        setConnectivityError(error);
      }
    });

    return cleanup; // Cleanup when component unmounts
  }, []);

  useEffect(() => {
    console.log("AppContent: playerUploadedTrackObject changed", playerUploadedTrackObject);
  }, [playerUploadedTrackObject]);

  useEffect(() => {
    console.log("AppContent: connectivityError changed", connectivityError);

    if (connectivityError === null) {
      if (currentConnectivityErrorTypeRef.current !== null) {
        currentConnectivityErrorTypeRef.current = null;
        hidePopup();
      }
    } else if (
      currentConnectivityErrorTypeRef.current !== null &&
      ![NetworkError, ServerError].includes(currentConnectivityErrorTypeRef.current) &&
      !(connectivityError instanceof currentConnectivityErrorTypeRef.current)
    ) {
      let popup: ReactNode | null = null;
      if ((connectivityError as ConnectivityError) instanceof AuthError) {
        popup = <SpotifyAuthPopup />;
      } else if (
        (connectivityError as ConnectivityError) instanceof BadRequestError ||
        (connectivityError as ConnectivityError) instanceof ServerError
      ) {
        popup = <InternalErrorPopup errorCode={connectivityError.code} />;
      } else if (connectivityError instanceof NetworkError) {
        popup = <NetworkErrorPopup />;
      }

      if (popup) {
        showPopup(popup);
      }

      currentConnectivityErrorTypeRef.current = connectivityError?.constructor as typeof ConnectivityError;
    }
  }, [connectivityError, showPopup, hidePopup, clearConnectivityError]);

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
        <main className="flex-grow mx-8">{children}</main>
        {isTrackListSidebarVisible && <TrackListSidebar className="fixed right-0 z-40" />}
      </div>

      {/* {playerUploadedTrackObject && <Player className="fixed bottom-0 z-50" />} */}
      {activePopup}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Music Tree</title>
        <meta
          name="description"
          content="Music Tree is a music guide that helps you find the best music for your mood"
        />
      </head>
      <body className={inter.className}>
        <PopupProvider>
          <Providers>
            <AppContent>{children}</AppContent>
          </Providers>
        </PopupProvider>
      </body>
    </html>
  );
}
