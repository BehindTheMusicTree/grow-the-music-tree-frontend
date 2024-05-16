import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PopupProvider } from "./contexts/popup/PopupContext";

import { PLAY_STATES, CONTENT_AREA_TYPES } from "./constants";
import ApiService from "./utils/service/apiService";
import { usePlayerTrackObject } from "./contexts/player-track-object/usePlayerTrackObject";
import { usePlaylistPlayObject } from "./contexts/playlist-play-object/usePlaylistPlayObject";
import { usePlayState } from "./contexts/play-state/usePlayState";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { playerTrackObject, setPlayerTrackObject } = usePlayerTrackObject();
  const {
    playlistPlayObject,
    playingPlaylistUuidWithLoadingState,
    setPlayingPlaylistUuidWithLoadingState,
    trackNumber,
    setTrackNumber,
  } = usePlaylistPlayObject();

  const { playState, setPlayState } = usePlayState();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  const pageTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    pageObject: null,
  });

  useEffect(() => {
    const setPlayingTrack = async (playingTrackObject) => {
      const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(
        playingTrackObject.libraryTrack.relativeUrl
      );
      setPlayerTrackObject({
        ...playingTrackObject.libraryTrack,
        blobUrl: playingLibTrackBlobUrl,
        hasNext: playlistPlayObject.contentObject.libraryTracks.length > trackNumber + 1,
        hasPrevious: trackNumber > 0,
      });
    };

    if (playingPlaylistUuidWithLoadingState && playingPlaylistUuidWithLoadingState.isLoading) {
      setTrackNumber(0);
    }

    if (playlistPlayObject && playlistPlayObject.contentObject.libraryTracks.length > trackNumber) {
      setPlayingTrack(playlistPlayObject.contentObject.libraryTracks[trackNumber]);
    }
  }, [playlistPlayObject, trackNumber]);

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
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="app flex flex-col h-screen">
                <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
                <PageContainer
                  pageTypeWithObject={pageTypeWithObject}
                  isTrackListSidebarVisible={isTrackListSidebarVisible}
                  playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}
                />
                {playerTrackObject && (
                  <Player
                    playState={playState}
                    setPlayState={setPlayState}
                    setIsTrackListSidebarVisible={setIsTrackListSidebarVisible}
                  />
                )}
                <Popup />
              </div>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </PopupProvider>
  );
}
