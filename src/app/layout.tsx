"use client";

import { useEffect, useRef, ReactNode } from "react";
import { initSentry } from "@/lib/sentry";
import "./globals.css";

import Providers from "@/app/providers";
import { useConnectivityError } from "@/contexts/ConnectivityErrorContext";
import { usePopup } from "@/contexts/PopupContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@/contexts/TrackListSidebarVisibilityContext";
import { ConnectivityError, NetworkError, AuthError, ServerError, BadRequestError } from "@/types/app-errors/app-error";
import Banner from "@/components/features/banner/Banner";
import Menu from "@/components/features/Menu";
import Player from "@/components/features/player/Player";
import TrackListSidebar from "@/components/features/track-list-sidebar/TrackListSidebar";
import Popup from "@/components/ui/popup/Popup";
import NetworkErrorPopup from "@/components/ui/popup/child/NetworkErrorPopup";

initSentry();

interface AppContentProps {
  children: ReactNode;
}

function AppContent({ children }: AppContentProps) {
  const { playerUploadedTrackObject } = usePlayer();
  const { showPopup, hidePopup, activePopup } = usePopup();
  const isTrackListSidebarVisible = useTrackListSidebarVisibility();
  const { connectivityError, clearConnectivityError } = useConnectivityError();
  const currentConnectivityErrorTypeRef = useRef<typeof ConnectivityError | null>(null);

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
      let popupType = "";

      if ((connectivityError as ConnectivityError) instanceof AuthError) {
        popupType = "authRequired";
      } else if (
        (connectivityError as ConnectivityError) instanceof BadRequestError ||
        (connectivityError as ConnectivityError) instanceof ServerError
      ) {
        popupType = "internalError";
        showPopup(popupType, {
          message: connectivityError.message,
          debugCode: connectivityError.code,
          onClose: () => {
            clearConnectivityError();
            hidePopup();
          },
        });
      } else if (connectivityError instanceof NetworkError) {
        popupType = typeof NetworkErrorPopup;
      }

      currentConnectivityErrorTypeRef.current = typeof connectivityError;
      showPopup(popupType, {
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
        <main className="flex-grow mx-8">{children}</main>
        {isTrackListSidebarVisible && <TrackListSidebar className="fixed right-0 z-40" />}
      </div>

      {playerUploadedTrackObject && <Player className="fixed bottom-0 z-50" />}
      {activePopup && <Popup type={activePopup.type} content={activePopup.content} onClose={hidePopup} />}
    </div>
  );
}

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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
