"use client";

import { useEffect } from "react";
import { initSentry } from "@/lib/sentry";
import { checkRequiredConfigVars } from "@/lib/config";
import { setupfetchInterceptor } from "@/utils/fetch/fetchInterceptor";
import { useFetchErrorHandler } from "@/hooks/useFetchErrorHandler";

import Banner from "@/components/client/features/banner/Banner";
import Menu from "@/components/client/features/Menu";
import Player from "@/components/client/features/player/Player";
import TrackListSidebar from "@/components/client/features/track-list-sidebar/TrackListSidebar";
import Popup from "@components/client/ui/popup/child/BasePopup";
import Providers from "@/app/providers";
import { usePopup } from "@/contexts/PopupContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { useTrackListSidebarVisibility } from "@/contexts/TrackListSidebarVisibilityContext";

initSentry();
checkRequiredConfigVars();

export default function RootLayout({ children }) {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();
  const isTrackListSidebarVisible = useTrackListSidebarVisibility();
  const { handleFetchError, ErrorPopup } = useFetchErrorHandler();

  useEffect(() => {
    setupfetchInterceptor(handleFetchError);
  }, [handleFetchError]);

  // Calculate dynamic heights based on player visibility
  const centerMaxHeight = {
    centerWithPlayer: "calc(100vh - 180px)", // Assuming banner is 100px and player is 80px
    centerWithoutPlayer: "calc(100vh - 100px)", // Only accounting for banner
  };

  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app flex flex-col h-screen">
            <Banner className="fixed top-0 z-50" />

            <div
              className="center bg-green-500 flex-grow flex overflow-y-auto"
              style={{
                maxHeight: playerUploadedTrackObject
                  ? centerMaxHeight.centerWithPlayer
                  : centerMaxHeight.centerWithoutPlayer,
              }}
            >
              <Menu />
              {
                /* 180px being the sum of the banner and player heights, 100px being the height of the banner alone */
                <div className={"page-container w-full flex-grow p-5 overflow-auto flex flex-col bg-gray-200 m-0"}>
                  <main>{children}</main>

                  {/* bottom-20 corresponding to 80px which is the player's height */}
                  {isTrackListSidebarVisible ? <TrackListSidebar /> : null}
                </div>
              }
            </div>
            {playerUploadedTrackObject && <Player />}
            {popupContentObject && <Popup />}
          </div>
        </Providers>
        <ErrorPopup />
      </body>
    </html>
  );
}
