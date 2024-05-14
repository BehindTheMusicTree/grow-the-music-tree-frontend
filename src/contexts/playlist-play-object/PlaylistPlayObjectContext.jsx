import { createContext, useState } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";

export const PlaylistPlayObjectContext = createContext();

export function PlaylistPlayObjectProvider({ children }) {
  const [playlistPlayObject, setPlaylistPlayObject] = useState(null);
  const [playingPlaylistUuidWithLoadingState, setPlayingPlaylistUuidWithLoadingState] = useState({
    uuid: null,
    isLoading: false,
  });

  const selectPlaylistUuidToPlay = async (uuid) => {
    setPlayingPlaylistUuidWithLoadingState({ uuid: uuid, isLoading: true });
    const newPlaylistPlayObject = await ApiService.postPlay(uuid);
    setPlaylistPlayObject(newPlaylistPlayObject);
  };

  return (
    <PlaylistPlayObjectContext.Provider
      value={{
        selectPlaylistUuidToPlay,
        playlistPlayObject,
        setPlaylistPlayObject,
        playingPlaylistUuidWithLoadingState,
        setPlayingPlaylistUuidWithLoadingState,
      }}
    >
      {children}
    </PlaylistPlayObjectContext.Provider>
  );
}

PlaylistPlayObjectProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
