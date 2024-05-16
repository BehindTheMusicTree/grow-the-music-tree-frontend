import { createContext, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";

export const PlaylistPlayObjectContext = createContext();

export function PlaylistPlayObjectProvider({ children }) {
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);
  const [trackPosition, setTrackPosition] = useState(0);
  const [playingPlaylistUuidWithLoadingState, setPlayingPlaylistUuidWithLoadingState] = useState({
    uuid: null,
    isLoading: false,
  });

  const selectPlaylistUuidToPlay = async (uuid) => {
    setPlayingPlaylistUuidWithLoadingState({ uuid: uuid, isLoading: true });
    const newPlaylistPlayObject = await ApiService.postPlay(uuid);
    setPlaylistPlayObject(newPlaylistPlayObject);
  };

  const toPreviousTrack = () => {
    setTrackPosition((prev) => prev - 1);
  };

  const toNextTrack = () => {
    setTrackPosition((prev) => prev + 1);
  };

  const toTrackAtPosition = (position) => {
    setTrackPosition(position);
  };

  return (
    <PlaylistPlayObjectContext.Provider
      value={{
        selectPlaylistUuidToPlay,
        playlistPlayObject,
        setPlaylistPlayObject,
        trackPosition,
        setTrackPosition,
        playingPlaylistUuidWithLoadingState,
        setPlayingPlaylistUuidWithLoadingState,
        toPreviousTrack,
        toNextTrack,
        toTrackAtPosition,
      }}
    >
      {children}
    </PlaylistPlayObjectContext.Provider>
  );
}

PlaylistPlayObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
