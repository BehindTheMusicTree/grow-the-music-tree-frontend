import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";
import { usePlayerTrackObject } from "../player-lib-track-object/usePlayerLibTrackObject";
import { TRACK_LIST_ORIGIN_TYPE, PLAY_STATES } from "../../constants";
import TrackListOrigin from "../../models/TrackListOrigin";

export const TrackListContext = createContext();

export function TrackListProvider({ children }) {
  const [trackList, setTrackList] = useState(null);
  const [trackListOrigin, setTrackListOrigin] = useState(null);
  const [playingTrackPosition, setLibTrackToPlayPosition] = useState(1);

  const { playState, setPlayState, setLibTrackToPlay } = usePlayerTrackObject();

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

  const setNewTrackListFromPlaylistUuid = async (uuid) => {
    setPlayState(PLAY_STATES.LOADING);
    setTrackListOrigin(null);
    const newPlaylistPlayObject = await ApiService.postPlay(uuid);
    setTrackList(newPlaylistPlayObject.contentObject.libraryTracks);
    setTrackListOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.PLAYLIST, newPlaylistPlayObject.contentObject));
  };

  const toPreviousTrack = () => {
    setLibTrackToPlayPosition((prev) => prev - 1);
  };

  const toNextTrack = () => {
    setLibTrackToPlayPosition((prev) => prev + 1);
  };

  const toTrackAtPosition = (position) => {
    setLibTrackToPlayPosition(position);
  };

  useEffect(() => {
    if (trackList && playState === PLAY_STATES.LOADING) {
      setLibTrackToPlayPosition(1);
    }

    if (trackList && trackList.length > playingTrackPosition - 1) {
      setLibTrackToPlay(
        trackList[playingTrackPosition - 1].libraryTrack,
        trackList.length > playingTrackPosition,
        playingTrackPosition > 1
      );
    }
  }, [trackListOrigin, playingTrackPosition]);

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        trackListOrigin,
        playingTrackPosition,
        refreshLibTrack,
        setNewTrackListFromPlaylistUuid,
        setLibTrackToPlayPosition,
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
