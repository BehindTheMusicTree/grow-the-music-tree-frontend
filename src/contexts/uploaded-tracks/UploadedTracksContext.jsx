import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { TrackService } from "../../utils/services";
import { useGenrePlaylists } from "../genre-playlists/useGenrePlaylists";

export const UploadedTracksContext = createContext();

export function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [uploadedTracks, setUploadedTracks] = useState();
  const [refreshuploadedTracksSignal, setRefreshUploadedTracksSignal] = useState(1);

  const areUploadedTrackFetchingRef = { current: false };

  async function postUploadedTrack(file, genreUuid, onProgress, badRequestCatched) {
    await TrackService.postUploadedTrack(file, genreUuid, onProgress, badRequestCatched);
    setRefreshGenrePlaylistsSignal(1);
  }

  async function fetchUploadedTracks() {
    const uploadedTracks = await TrackService.getUploadedTracks();
    setUploadedTracks(uploadedTracks);
  }

  useEffect(() => {
    const fetchUploadedTracksAsync = async () => {
      if (refreshuploadedTracksSignal == 1 && !areUploadedTrackFetchingRef.current) {
        areUploadedTrackFetchingRef.current = true;
        await fetchUploadedTracks();
        areUploadedTrackFetchingRef.current = false;
        setRefreshUploadedTracksSignal(0);
      }
    };

    fetchUploadedTracksAsync();
  }, [refreshuploadedTracksSignal]);

  return (
    <UploadedTracksContext.Provider value={{ uploadedTracks, postUploadedTrack, setRefreshUploadedTracksSignal }}>
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
