import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";
import { usePlayer } from "../player/usePlayer";
import { TRACK_LIST_ORIGIN_TYPE, PLAY_STATES } from "../../constants";
import TrackListOrigin from "../../models/TrackListOrigin";

export const TrackListContext = createContext();

export function TrackListProvider({ children }) {
  const [trackList, setTrackList] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [playingLibTrackPosition, playLibTrackAtPosition] = useState(1);

  const { playState, setPlayState, setLibTrackToPlay } = usePlayer();

  const refreshLibTrack = async (updatedLibTrack) => {
    const newTrackList = trackList.map((oldPlaylistTrackRelation) => {
      if (oldPlaylistTrackRelation.libraryTrack.uuid === updatedLibTrack.uuid) {
        return {
          ...oldPlaylistTrackRelation,
          libraryTrack: updatedLibTrack,
        };
      }
      return oldPlaylistTrackRelation;
    });
    setTrackList(newTrackList);
  };

  const setNewTrackListFromLibTrackUuid = async (uuid) => {
    setPlayState(PLAY_STATES.LOADING);
    setOrigin(null);
    const newLibTrackPlayObject = await ApiService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.LIB_TRACK, newLibTrackPlayObject.contentObject));
    setTrackList([{ potition: "1", libraryTrack: newLibTrackPlayObject.contentObject }]);
  };

  const playNewTrackListFromPlaylistUuid = async (uuid) => {
    setPlayState(PLAY_STATES.LOADING);
    setOrigin(null);
    const newPlaylistPlayObject = await ApiService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.PLAYLIST, newPlaylistPlayObject.contentObject));
    setTrackList(newPlaylistPlayObject.contentObject.libraryTracks);
  };

  const toPreviousTrack = () => {
    playLibTrackAtPosition((prev) => prev - 1);
  };

  const toNextTrack = () => {
    playLibTrackAtPosition((prev) => prev + 1);
  };

  const toTrackAtPosition = (position) => {
    playLibTrackAtPosition(position);
  };

  useEffect(() => {
    if (trackList && playState === PLAY_STATES.LOADING) {
      playLibTrackAtPosition(1);
    }

    if (trackList && trackList.length > playingLibTrackPosition - 1) {
      setLibTrackToPlay(
        trackList[playingLibTrackPosition - 1].libraryTrack,
        trackList.length > playingLibTrackPosition,
        playingLibTrackPosition > 1
      );
    }
  }, [origin, playingLibTrackPosition]);

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        origin,
        playingLibTrackPosition,
        refreshLibTrack,
        setNewTrackListFromLibTrackUuid,
        playNewTrackListFromPlaylistUuid,
        playLibTrackAtPosition,
        toPreviousTrack,
        toNextTrack,
        toTrackAtPosition,
      }}
    >
      {children}
    </TrackListContext.Provider>
  );
}

TrackListProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
