import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { UploadedTrackService } from "../utils/services";
import { useGenrePlaylists } from "./GenrePlaylistsContext";
import UnauthorizedRequestError from "../utils/errors/UnauthorizedRequestError";
import useApiConnectivity from "../hooks/useApiConnectivity";
import useAuthState from "../hooks/useAuthState";
import { useAuthenticatedDataRefreshSignal } from "../hooks/useAuthenticatedDataRefreshSignal";
import { handleApiError } from "../utils/apiErrorHandler";
import { checkTokenAndShowAuthIfNeeded } from "../utils/authUtils";

export const UploadedTracksContext = createContext();

export function useUploadedTracks() {
  const context = useContext(UploadedTracksContext);
  if (!context) {
    throw new Error("useUploadedTracks must be used within an UploadedTracksProvider");
  }
  return context;
}

export function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const { isAuthenticated } = useAuthState();
  const { checkApiConnectivity } = useApiConnectivity();
  const { triggerRefresh } = useAuthenticatedDataRefreshSignal();

  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const fetchUploadedTracks = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      await checkApiConnectivity();
      await checkTokenAndShowAuthIfNeeded();

      const response = await fetch("/api/uploaded-tracks", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("spotify_access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUploadedTracks(data);
    } catch (error) {
      setError(error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, checkApiConnectivity]);

  useEffect(() => {
    fetchUploadedTracks();
  }, [fetchUploadedTracks, triggerRefresh]);

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

      if (handleApiError(error, "/api/library/uploaded")) {
        return { success: false, connectivityError: true };
      }

      throw error;
    }
  }

  return (
    <UploadedTracksContext.Provider
      value={{
        uploadedTracks,
        error,
        loading,
        currentPage,
        setCurrentPage,
        hasMore,
        postUploadedTrack,
        setRefreshSignal: triggerRefresh,
      }}
    >
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
