import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { UploadedTrackService } from "../../utils/services";
import { useGenrePlaylists } from "../genre-playlists/useGenrePlaylists";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";

export const UploadedTracksContext = createContext();

export function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [refreshuploadedTracksSignal, setRefreshUploadedTracksSignal] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;
  const { checkTokenAndShowAuthIfNeeded } = useSpotifyAuth();

  const areUploadedTrackFetchingRef = { current: false };

  async function postUploadedTrack(file, genreUuid, onProgress, badRequestCatched) {
    if (!checkTokenAndShowAuthIfNeeded(true)) {
      return { success: false, authRequired: true };
    }

    try {
      await UploadedTrackService.uploadTrack(file, genreUuid, onProgress, badRequestCatched);
      setRefreshGenrePlaylistsSignal(1);
      return { success: true };
    } catch (error) {
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true);
        return { success: false, authRequired: true };
      }
      throw error;
    }
  }

  async function fetchUploadedTracks(page = 1, showErrors = true) {
    try {
      setLoading(true);
      const result = await UploadedTrackService.getUploadedTracks(page, pageSize, showErrors);

      if (result.authRequired) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

      if (result.success) {
        if (page === 1) {
          setUploadedTracks(result.tracks);
        } else {
          setUploadedTracks((prev) => [...prev, ...result.tracks]);
        }
        setHasMore(result.tracks.length === pageSize);
        setError(null);
      } else {
        setError(result.error || "Failed to load tracks");
      }
    } catch (error) {
      console.error("Error fetching uploaded tracks:", error);
      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
      } else {
        setError("Failed to load tracks");
      }
    } finally {
      setLoading(false);
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
      fetchUploadedTracks(currentPage + 1);
    }
  };

  useEffect(() => {
    const fetchUploadedTracksAsync = async () => {
      if (refreshuploadedTracksSignal === 1 && !areUploadedTrackFetchingRef.current) {
        areUploadedTrackFetchingRef.current = true;
        setCurrentPage(1);
        await fetchUploadedTracks(1);
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
        error,
        loading,
        hasMore,
        loadMore,
      }}
    >
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
