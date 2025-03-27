import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { TrackService } from "../../utils/services";
import { useGenrePlaylists } from "../../contexts/genre-playlists/useGenrePlaylists";

export const LibTracksContext = createContext();

export function LibTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [libTracks, setLibTracks] = useState();
  const [refreshlibTracksSignal, setRefreshLibTracksSignal] = useState(1);

  const areLibTrackFetchingRef = { current: false };

  async function postLibTrack(file, genreUuid, onProgress, badRequestCatched) {
    await TrackService.postLibTrack(file, genreUuid, onProgress, badRequestCatched);
    setRefreshGenrePlaylistsSignal(1);
  }

  async function fetchLibTracks() {
    const libTracks = await TrackService.getLibTracks();
    setLibTracks(libTracks);
  }

  useEffect(() => {
    const fetchLibTracksAsync = async () => {
      if (refreshlibTracksSignal == 1 && !areLibTrackFetchingRef.current) {
        areLibTrackFetchingRef.current = true;
        await fetchLibTracks();
        areLibTrackFetchingRef.current = false;
        setRefreshLibTracksSignal(0);
      }
    };

    fetchLibTracksAsync();
  }, [refreshlibTracksSignal]);

  return (
    <LibTracksContext.Provider value={{ libTracks, postLibTrack, setRefreshLibTracksSignal }}>
      {children}
    </LibTracksContext.Provider>
  );
}

LibTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
