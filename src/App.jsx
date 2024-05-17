import { useState, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PopupProvider } from "./contexts/popup/PopupContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { CONTENT_AREA_TYPES } from "./constants";
import { usePlayerTrackObject } from "./contexts/player-lib-track-object/usePlayerLibTrackObject";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { playerLibTrackObject } = usePlayerTrackObject();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const pageTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    pageObject: null,
  });

  return (
    <PopupProvider>
      <TrackListSidebarVisibilityProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <div className="app flex flex-col h-screen">
                  <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
                  <PageContainer pageTypeWithObject={pageTypeWithObject} />
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
  );
}
