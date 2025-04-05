import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { TrackService } from "../../utils/services";
import { useGenrePlaylists } from "../genre-playlists/useGenrePlaylists";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";

export const UploadedTracksContext = createContext();

export function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [uploadedTracks, setUploadedTracks] = useState();
  const [refreshuploadedTracksSignal, setRefreshUploadedTracksSignal] = useState(1);
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  const areUploadedTrackFetchingRef = { current: false };

  async function postUploadedTrack(file, genreUuid, onProgress, badRequestCatched) {
    // Check for valid Spotify token before API call
    if (!checkTokenAndShowAuthIfNeeded(true)) {
      return { success: false, authRequired: true };
    }

    try {
      await TrackService.postUploadedTrack(file, genreUuid, onProgress, badRequestCatched);
      setRefreshGenrePlaylistsSignal(1);
      return { success: true };
    } catch (error) {
      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return { success: false, authRequired: true };
      }
      throw error; // Re-throw other errors
    }
  }

  async function fetchUploadedTracks() {
    try {
      // Check for valid Spotify token before API call
      if (!checkTokenAndShowAuthIfNeeded(true)) {
        setError("Authentication required");
        return;
      }

      const uploadedTracks = await TrackService.getUploadedTracks();
      setUploadedTracks(uploadedTracks);
      setError(null);
    } catch (error) {
      console.error("Error fetching uploaded tracks:", error);

      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
      } else {
        setError("Failed to load tracks");
      }
    }
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
    <UploadedTracksContext.Provider
      value={{
        uploadedTracks,
        postUploadedTrack,
        setRefreshUploadedTracksSignal,
        error, // Include error state in context value
      }}
    >
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
