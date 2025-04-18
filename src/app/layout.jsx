"use client";

import { useEffect, useRef } from "react";
import { initSentry } from "@lib/sentry";
import "./globals.css";

import Providers from "@app/providers";
import { useConnectivityError } from "@contexts/ConnectivityErrorContext";
import { usePopup } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@contexts/TrackListSidebarVisibilityContext";
import Banner from "@components/features/banner/Banner";
import Menu from "@components/features/Menu";
import Player from "@components/features/player/Player";
import TrackListSidebar from "@components/features/track-list-sidebar/TrackListSidebar";
import Popup from "@components/ui/popup/Popup";

initSentry();

function AppContent({ children }) {
  const { playerUploadedTrackObject } = usePlayer();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const isTrackListSidebarVisible = useTrackListSidebarVisibility();
  const { connectivityError, clearConnectivityError, ConnectivityErrorType } = useConnectivityError();
  const hasPopupRef = useRef(false);

  useEffect(() => {
    hasPopupRef.current = activePopup !== null;
  }, [activePopup]);

  useEffect(() => {
    if (connectivityError?.type !== ConnectivityErrorType.NONE && !hasPopupRef.current) {
      let popupType = "networkError";
      let title = "Network Error";

      if (connectivityError.type === ConnectivityErrorType.AUTH_REQUIRED) {
        popupType = "authRequired";
      } else if (
        connectivityError.type === ConnectivityErrorType.BAD_REQUEST ||
        connectivityError.type === ConnectivityErrorType.INTERNAL
      ) {
        popupType = "internalError";
        title = "Internal Error";
      } else if (connectivityError.type === ConnectivityErrorType.NETWORK) {
        popupType = "networkError";
        title = "Network Error";
      }

      showPopup(popupType, {
        title,
        message: connectivityError.message,
        debugCode: connectivityError.code,
        onClose: () => {
          clearConnectivityError();
          hidePopup();
        },
      });
    }
  }, [connectivityError, showPopup, hidePopup, clearConnectivityError, ConnectivityErrorType]);

  // Calculate dynamic heights based on player visibility
  const centerMaxHeight = {
    centerWithPlayer: "calc(100vh - 180px)", // Assuming banner is 100px and player is 80px
    centerWithoutPlayer: "calc(100vh - 100px)", // Only accounting for banner
  };

  return (
    <div className="app flex flex-col h-screen">
      <Banner className="fixed top-0 z-50" />

      <div
        className="center bg-gray-100 flex-grow flex overflow-y-auto"
        style={{
          maxHeight: playerUploadedTrackObject ? centerMaxHeight.centerWithPlayer : centerMaxHeight.centerWithoutPlayer,
        }}
      >
        <Menu className="fixed left-0 z-40" />
        <main className="flex-grow ml-16">{children}</main>
        {isTrackListSidebarVisible && <TrackListSidebar className="fixed right-0 z-40" />}
      </div>

      {playerUploadedTrackObject && <Player className="fixed bottom-0 z-50" />}
      {activePopup && <Popup type={activePopup.type} content={activePopup.content} onClose={hidePopup} />}
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppContent>{children}</AppContent>
        </Providers>
      </body>
    </html>
  );
}
