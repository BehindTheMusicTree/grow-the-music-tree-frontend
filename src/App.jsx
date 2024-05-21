import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PageProvider } from "./contexts/page/PageContext";
import { PopupProvider } from "./contexts/popup/PopupContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { usePlayerTrackObject } from "./contexts/player-lib-track-object/usePlayerLibTrackObject";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import Menu from "./components/menu/Menu";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { playerLibTrackObject } = usePlayerTrackObject();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  return (
    <PageProvider>
      <PopupProvider>
        <TrackListSidebarVisibilityProvider>
          <Router>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="app flex flex-col h-screen">
                    <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
                    <div className="center flex">
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
  );
}
