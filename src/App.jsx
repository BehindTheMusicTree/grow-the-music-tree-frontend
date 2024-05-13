import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Howler } from "howler";

import { PopupProvider } from "./contexts/popup/PopupContext";

import { PLAY_STATES, CONTENT_AREA_TYPES } from "./constants";
import ApiService from "./utils/service/apiService";
import { usePlayerTrackObject } from "./contexts/player-track-object/usePlayerTrackObject.jsx";
import { usePlaylistPlayObject } from "./contexts/playlist-play-object/usePlaylistPlayObject.jsx";

import Popup from "./components/popup/Popup";
import Banner from "./components/banner/Banner";
import PageContainer from "./components/page-container/PageContainer";
import Player from "./components/player/Player";
import NotFoundPage from "./components/NotFoundPage";

Howler.autoUnlock = true;

export default function App() {
  const { playerTrackObject, setPlayerTrackObject } = usePlayerTrackObject();
  const { playlistPlayObject, setPlaylistPlayObject } = usePlaylistPlayObject();

  const [searchSubmitted, setSearchSubmitted] = useState("");

  const [isTrackListSidebarVisible, setIsTrackListSidebarVisible] = useState(false);

  const [playingPlaylistUuidWithPlayState, setPlayingPlaylistUuidWithLoadingState] = useState(null);
  const [playingPlaylistLibTrackNumber, setPlayingPlaylistLibTrackNumber] = useState(0);

  const [playState, setPlayState] = useState(PLAY_STATES.PLAYING);
  const [shouldResetPlayerSeek, setshouldResetPlayerSeek] = useState(false);

  const [refreshGenresSignal, setRefreshGenresSignal] = useState(0);

  const contentAreaTypeWithObject = useRef({
    type: CONTENT_AREA_TYPES.GENRES,
    contentObject: null,
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

  const selectPlaylistUuidToPlay = async (uuid) => {
    setPlayingPlaylistUuidWithLoadingState({ uuid: uuid, isLoading: true });
    setPlaylistPlayObject(await ApiService.postPlay(uuid));
  };

  const setPreviousTrack = () => {
    setshouldResetPlayerSeek(true);
    setPlayingPlaylistLibTrackNumber((prev) => prev - 1);
  };

  const setNextTrack = () => {
    setshouldResetPlayerSeek(true);
    setPlayingPlaylistLibTrackNumber((prev) => prev + 1);
  };

  useEffect(() => {
    const setPlayingTrack = async (playingTrackObject) => {
      const playingLibTrackBlobUrl = await ApiService.loadAudioAndGetLibTrackBlobUrl(
        playingTrackObject.libraryTrack.relativeUrl
      );
      setPlayerTrackObject({
        ...playingTrackObject.libraryTrack,
        blobUrl: playingLibTrackBlobUrl,
        hasNext: playlistPlayObject.contentObject.libraryTracks.length > playingPlaylistLibTrackNumber + 1,
        hasPrevious: playingPlaylistLibTrackNumber > 0,
      });
    };

    if (playingPlaylistUuidWithPlayState && playingPlaylistUuidWithPlayState.isLoading) {
      setPlayingPlaylistLibTrackNumber(0);
    }

    if (playlistPlayObject && playlistPlayObject.contentObject.libraryTracks.length > playingPlaylistLibTrackNumber) {
      setPlayingTrack(playlistPlayObject.contentObject.libraryTracks[playingPlaylistLibTrackNumber]);
    }
  }, [playlistPlayObject, playingPlaylistLibTrackNumber]);

  useEffect(() => {
    if (playerTrackObject) {
      if (playingPlaylistUuidWithPlayState.isLoading) {
        setPlayingPlaylistUuidWithLoadingState({ ...playingPlaylistUuidWithPlayState, isLoading: false });
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
                    contentAreaTypeWithObject={contentAreaTypeWithObject}
                    isTrackListSidebarVisible={isTrackListSidebarVisible}
                    selectPlaylistUuidToPlay={selectPlaylistUuidToPlay}
                    playState={playState}
                    playingPlaylistUuidWithLoadingState={playingPlaylistUuidWithPlayState}
                    refreshGenresSignal={refreshGenresSignal}
                    handleUpdatedLibTrack={handleUpdatedLibTrack}
                  />
                  {playerTrackObject && (
                    <Player
                      playState={playState}
                      setPlayState={setPlayState}
                      shouldResetPlayerSeek={shouldResetPlayerSeek}
                      setshouldResetPlayerSeek={setshouldResetPlayerSeek}
                      setNextTrack={setNextTrack}
                      setPreviousTrack={setPreviousTrack}
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
