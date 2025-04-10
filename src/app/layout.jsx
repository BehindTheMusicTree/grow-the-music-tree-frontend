import { useState } from "react";

import Banner from "@components/banner/Banner";
import Menu from "@components/menu/Menu";
import PageContainer from "@components/page-container/PageContainer";
import Player from "@components/player/Player";
import Popup from "@components/popup/Popup";
import Providers from "@/app/providers";
import { usePopup } from "@contexts/PopupContext";
import { usePlayer } from "@contexts/PlayerContext";

export default function RootLayout() {
  const { playerUploadedTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();

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
              <PageContainer />
            </div>
            {playerUploadedTrackObject && <Player />}
            {popupContentObject && <Popup />}
          </div>
        </Providers>
      </body>
    </html>
  );
}
