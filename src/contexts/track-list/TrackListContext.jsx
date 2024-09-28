import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils//ApiService";
import { usePlayer } from "../player/usePlayer";
import { TRACK_LIST_ORIGIN_TYPE, PLAY_STATES } from "../../utils/constants";
import TrackListOrigin from "../../models/TrackListOrigin";

export const TrackListContext = createContext();

export function TrackListProvider({ children }) {
  const [trackList, setTrackList] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [playingLibTrackPosition, setPlayingLibTrackPosition] = useState(null);

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

  const playNewTrackListFromLibTrackUuid = async (uuid) => {
    const newLibTrackPlayObject = await ApiService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.LIB_TRACK, newLibTrackPlayObject.contentObject));
  };

  const playNewTrackListFromPlaylistUuid = async (uuid) => {
    const newPlaylistPlayObject = await ApiService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.PLAYLIST, newPlaylistPlayObject.contentObject));
  };

  const toPreviousTrack = () => {
    setPlayingLibTrackPosition((prev) => prev - 1);
  };

  const toNextTrack = () => {
    console.log("toNext, next track position: ", playingLibTrackPosition + 1);
    setPlayingLibTrackPosition((prev) => prev + 1);
  };

  const toTrackAtPosition = (position) => {
    setPlayingLibTrackPosition(position);
  };

  useEffect(() => {
    if (origin) {
      if (origin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST) {
        setTrackList(origin.object.libraryTracks);
      } else if (origin.type === TRACK_LIST_ORIGIN_TYPE.LIB_TRACK) {
        setTrackList([{ potition: "1", libraryTrack: origin.object }]);
      }
    }
  }, [origin]);

  useEffect(() => {
    if (trackList) {
      setPlayingLibTrackPosition(1);
    }
  }, [trackList]);

  useEffect(() => {
    if (trackList && trackList.length > playingLibTrackPosition - 1) {
      setPlayState(PLAY_STATES.LOADING);
    }
  }, [playingLibTrackPosition]);

  useEffect(() => {
    if (playState === PLAY_STATES.LOADING) {
      console.log("Loading track at position: ", playingLibTrackPosition);
      setLibTrackToPlay(
        trackList[playingLibTrackPosition - 1].libraryTrack,
        trackList.length > playingLibTrackPosition,
        playingLibTrackPosition > 1
      );
    }
  }, [playState]);

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        origin,
        playingLibTrackPosition,
        refreshLibTrack,
        playNewTrackListFromLibTrackUuid,
        playNewTrackListFromPlaylistUuid,
        playLibTrackAtPosition: setPlayingLibTrackPosition,
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
