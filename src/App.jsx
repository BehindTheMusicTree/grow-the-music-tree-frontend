import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { LibTracksProvider } from "./contexts/lib-tracks/LibTracksContext";
import { PopupProvider } from "./contexts/popup/PopupContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { usePlayer } from "./contexts/player/usePlayer";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import Menu from "./components/menu/Menu";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { libTrackObject: playerLibTrackObject } = usePlayer();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  return (
    <LibTracksProvider>
      <PageProvider>
        <PopupProvider>
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
                        className={
                          "center bg-green-500 flex-grow flex overflow-y-auto max-h-[calc(100%-" +
                          (playerLibTrackObject ? "180px" : "100px") +
                          ")]"
                        }
                      >
                        <Menu />
                        <PageContainer />
                      </div>
                      {playerLibTrackObject && <Player />}
                      <Popup />
                    </div>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </TrackListSidebarVisibilityProvider>
        </PopupProvider>
      </PageProvider>
    </LibTracksProvider>
  );
}
