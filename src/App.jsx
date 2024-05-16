import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PopupProvider } from "./contexts/popup/PopupContext";
import { TrackListSidebarVisibilityProvider } from "./contexts/track-list-sidebar-visibility/TrackListSidebarVisibilityContext";

import { PLAY_STATES, CONTENT_AREA_TYPES } from "./constants";
import { usePlayerTrackObject } from "./contexts/player-track-object/usePlayerTrackObject";
import { usePlaylistPlayObject } from "./contexts/playlist-play-object/usePlaylistPlayObject";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { playerTrackObject, setPlayState, setPlayingTrack } = usePlayerTrackObject();
  const {
    playlistPlayObject,
    playingPlaylistUuidWithLoadingState,
    setPlayingPlaylistUuidWithLoadingState,
    trackPosition,
    setTrackPosition,
  } = usePlaylistPlayObject();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const pageTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    pageObject: null,
  });

  useEffect(() => {
    if (playingPlaylistUuidWithLoadingState && playingPlaylistUuidWithLoadingState.isLoading) {
      setTrackPosition(1);
    }

    if (playlistPlayObject && playlistPlayObject.contentObject.libraryTracks.length > trackPosition - 1) {
      setPlayingTrack(
        playlistPlayObject.contentObject.libraryTracks[trackPosition - 1],
        playlistPlayObject.contentObject.libraryTracks.length > trackPosition,
        trackPosition > 1
      );
    }
  }, [playlistPlayObject, trackPosition]);

  useEffect(() => {
    if (playerTrackObject) {
      if (playingPlaylistUuidWithLoadingState.isLoading) {
        setPlayingPlaylistUuidWithLoadingState({ ...playingPlaylistUuidWithLoadingState, isLoading: false });
        setPlayState(PLAY_STATES.PLAYING);
      }
    }
  }, [playerTrackObject]);

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
                  <PageContainer
                    pageTypeWithObject={pageTypeWithObject}
                    playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}
                  />
                  {playerTrackObject && <Player />}
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
