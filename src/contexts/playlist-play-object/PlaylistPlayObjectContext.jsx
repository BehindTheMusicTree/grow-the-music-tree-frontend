import { createContext, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";

export const PlaylistPlayObjectContext = createContext();

export function PlaylistPlayObjectProvider({ children }) {
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);
  const [trackNumber, setTrackNumber] = useState(0);
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
    setTrackNumber((prev) => prev - 1);
  };

  const toNextTrack = () => {
    setTrackNumber((prev) => prev + 1);
  };

  return (
    <PlaylistPlayObjectContext.Provider
      value={{
        selectPlaylistUuidToPlay,
        playlistPlayObject,
        setPlaylistPlayObject,
        trackNumber,
        setTrackNumber,
        playingPlaylistUuidWithLoadingState,
        setPlayingPlaylistUuidWithLoadingState,
        toPreviousTrack,
        toNextTrack,
      }}
    >
      {children}
    </PlaylistPlayObjectContext.Provider>
  );
}

PlaylistPlayObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
