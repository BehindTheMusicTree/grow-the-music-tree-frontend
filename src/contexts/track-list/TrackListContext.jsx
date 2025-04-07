import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

import { PlaylistService } from "../../utils/services";
import { usePlayer } from "../player/usePlayer";
import { TRACK_LIST_ORIGIN_TYPE, PLAY_STATES } from "../../utils/constants";
import TrackListOrigin from "../../models/TrackListOrigin";

export const TrackListContext = createContext();

export function TrackListProvider({ children }) {
  const [trackList, setTrackList] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [playingUploadedTrackPosition, setPlayingUploadedTrackPosition] = useState(null);

  const { playState, setPlayState, setUploadedTrackToPlay } = usePlayer();

  const refreshUploadedTrack = async (updatedUploadedTrack) => {
    const newTrackList = trackList.map((oldUploadedTrack) => {
      if (oldUploadedTrack.uuid === updatedUploadedTrack.uuid) {
        return updatedUploadedTrack;
      }
      return oldUploadedTrack;
    });
    setTrackList(newTrackList);
  };

  const playNewTrackListFromUploadedTrackUuid = async (uuid) => {
    const newUploadedTrackPlayObject = await PlaylistService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.UPLOADED_TRACK, newUploadedTrackPlayObject.content));
  };

  const playNewTrackListFromPlaylistUuid = async (uuid) => {
    const newPlaylistPlayObject = await PlaylistService.postPlay(uuid);
    setOrigin(new TrackListOrigin(TRACK_LIST_ORIGIN_TYPE.PLAYLIST, newPlaylistPlayObject.content));
  };

  const toPreviousTrack = () => {
    setPlayingUploadedTrackPosition((prev) => prev - 1);
  };

  const toNextTrack = () => {
    setPlayingUploadedTrackPosition((prev) => prev + 1);
  };

  const toTrackAtPosition = (position) => {
    setPlayingUploadedTrackPosition(position);
  };

  useEffect(() => {
    if (origin) {
      setPlayingUploadedTrackPosition(1);
      if (origin.type === TRACK_LIST_ORIGIN_TYPE.PLAYLIST) {
        const trackList = origin.object.libraryTrackPlaylistRelations
          .sort((a, b) => a.position - b.position)
          .map((relation) => relation.libraryTrack);
        setTrackList(trackList);
      } else if (origin.type === TRACK_LIST_ORIGIN_TYPE.UPLOADED_TRACK) {
        setTrackList([origin.object]);
      }
    }
  }, [origin]);

  useEffect(() => {
    if (trackList && trackList.length > playingUploadedTrackPosition - 1) {
      setPlayState(PLAY_STATES.LOADING);
    }
  }, [origin, playingUploadedTrackPosition, trackList, setPlayState]);

  useEffect(() => {
    if (playState === PLAY_STATES.LOADING) {
      setUploadedTrackToPlay(
        trackList[playingUploadedTrackPosition - 1],
        trackList.length > playingUploadedTrackPosition,
        playingUploadedTrackPosition > 1
      );
    }
  }, [playState, trackList, playingUploadedTrackPosition, setUploadedTrackToPlay]);

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
        origin,
        playingUploadedTrackPosition,
        refreshUploadedTrack,
        playNewTrackListFromUploadedTrackUuid,
        playNewTrackListFromPlaylistUuid,
        playUploadedTrackAtPosition: setPlayingUploadedTrackPosition,
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

export default TrackListProvider;
