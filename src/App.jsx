import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { usePlayer } from "./contexts/player/usePlayer";
import { usePopup } from "./contexts/popup/usePopup";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import Menu from "./components/menu/Menu";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import ApiErrorHandler from "./components/utils/ApiErrorHandler";
import NotFoundPage from "./components/utils/NotFoundPage";
import SpotifyCallback from "./components/auth/SpotifyCallback";

Howler.autoUnlock = true;

export default function App() {
  const { playerLibTrackObject } = usePlayer();
  const { popupContentObject } = usePopup();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const centerMaxHeight = {
    centerWithoutPlayer: "calc(100% - 100px)",
    centerWithPlayer: "calc(100% - 180px)",
  };

  return (
    <ApiErrorHandler>
      <PageProvider>
        <TrackListSidebarVisibilityProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="app flex flex-col h-screen">
                    <Banner
                      className="fixed top-0 z-50"
                      searchSubmitted={searchSubmitted}
                      setSearchSubmitted={setSearchSubmitted}
                    />
                    <div
                      className="center bg-green-500 flex-grow flex overflow-y-auto"
                      style={{
                        maxHeight: playerLibTrackObject
                          ? centerMaxHeight.centerWithPlayer
                          : centerMaxHeight.centerWithoutPlayer,
                      }}
                    >
                      <Menu />
                      <PageContainer />
                    </div>
                    {playerLibTrackObject && <Player />}
                    {popupContentObject && <Popup />}
                  </div>
                }
              />
              <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </TrackListSidebarVisibilityProvider>
      </PageProvider>
    </ApiErrorHandler>
  );
}
