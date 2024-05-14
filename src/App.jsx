import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PopupProvider } from "./contexts/popup/PopupContext";

import { PLAY_STATES, CONTENT_AREA_TYPES } from "./constants";
import ApiService from "./utils/service/apiService";
import { usePlayerTrackObject } from "./contexts/player-track-object/usePlayerTrackObject.jsx";
import { usePlaylistPlayObject } from "./contexts/playlist-play-object/usePlaylistPlayObject.jsx";
import { usePlayState } from "./contexts/play-state/usePlayState.jsx";

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
    setPlaylistPlayObject,
    playingPlaylistUuidWithLoadingState,
    setPlayingPlaylistUuidWithLoadingState,
    trackNumber,
    setTrackNumber,
  } = usePlaylistPlayObject();

  const { playState, setPlayState } = usePlayState(PLAY_STATES.PLAYING);

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  const [refreshGenresSignal, setRefreshGenresSignal] = useState(0);

  const pageTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    pageObject: null,
  });

  const handleUpdatedLibTrack = async (updatedLibTrack) => {
    setPlaylistPlayObject((currentState) => {
      const newState = { ...currentState };
      const oldTrack = newState.contentObject.libraryTracks.find(
        (track) => track.libraryTrack.uuid === updatedLibTrack.uuid
      );
      const genreChanged = oldTrack && oldTrack.libraryTrack.genre !== updatedLibTrack.genre;

      newState.contentObject.libraryTracks = newState.contentObject.libraryTracks.map((playlistTrackRelation) =>
        playlistTrackRelation.libraryTrack.uuid === updatedLibTrack.uuid
          ? { ...playlistTrackRelation, libraryTrack: updatedLibTrack }
          : playlistTrackRelation
      );

      if (genreChanged) {
        setRefreshGenresSignal((oldSignal) => oldSignal + 1);
      }

      return newState;
    });
  };

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
              <div className="App flex flex-col h-full">
                <Banner searchSubmitted={searchSubmitted} setSearchSubmitted={setSearchSubmitted} />
                <div className="Body flex h-full">
                  <PageContainer
                    pageTypeWithObject={pageTypeWithObject}
                    isTrackListSidebarVisible={isTrackListSidebarVisible}
                    playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithLoadingState}
                    refreshGenresSignal={refreshGenresSignal}
                    handleUpdatedLibTrack={handleUpdatedLibTrack}
                  />
                  {playerTrackObject && (
                    <Player
                      playState={playState}
                      setPlayState={setPlayState}
                      setIsTrackListSidebarVisible={setIsTrackListSidebarVisible}
                    />
                  )}
                </div>
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
