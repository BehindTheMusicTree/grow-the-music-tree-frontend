import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import ApiService from "../../utils/service/apiService";
import { useGenrePlaylists } from "../../contexts/genre-playlists/useGenrePlaylists";

export const LibTracksContext = createContext();

export function LibTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal } = useGenrePlaylists();
  const [libTracks, setlibTracks] = useState();
  const [refreshlibTracksSignal, setRefreshlibTracksSignal] = useState(1);

  const areLibTrackFetchingRef = { current: false };

  async function postLibTrack(file, genreUuid, onProgress) {
    await ApiService.postLibTracks(file, genreUuid, onProgress);
    setRefreshGenrePlaylistsSignal(1);
    fetchLibTracks();
  }

  async function fetchLibTracks() {
    const libTracks = await ApiService.getLibTracks();
    setlibTracks(libTracks);
  }

  useEffect(() => {
    if (refreshlibTracksSignal == 1 && !areLibTrackFetchingRef.current) {
      areLibTrackFetchingRef.current = true;
      fetchLibTracks();
      areLibTrackFetchingRef.current = false;
      setRefreshlibTracksSignal(0);
    }
  }, [refreshlibTracksSignal]);

  return (
    <LibTracksContext.Provider value={{ libTracks, postLibTrack, setRefreshlibTracksSignal }}>
      {children}
    </LibTracksContext.Provider>
  );
}

LibTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
