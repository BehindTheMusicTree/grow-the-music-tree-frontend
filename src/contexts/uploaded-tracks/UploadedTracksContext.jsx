import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import { UploadedTrackService } from "../../utils/services";
import { useGenrePlaylists } from "../genre-playlists/useGenrePlaylists";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";
import useApiConnectivity from "../../hooks/useApiConnectivity";
import useAuthChangeHandler from "../../hooks/useAuthChangeHandler";
import useAuthState from "../../hooks/useAuthState";
import useSpotifyAuthActions from "../../hooks/useSpotifyAuthActions";
import ApiTokenService from "../../utils/services/ApiTokenService";
import { useAuthenticatedDataRefreshSignal } from "../../hooks/useAuthenticatedDataRefreshSignal";

export const UploadedTracksContext = createContext();

export function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  const { refreshSignal, setRefreshSignal, isOperationInProgressRef } = useAuthenticatedDataRefreshSignal();
  const isAuthenticated = useAuthState();
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: setRefreshSignal,
    fetchingRef: isOperationInProgressRef,
    refreshInProgressRef: isOperationInProgressRef,
  });

  // Setup authentication handling and event listeners
  const { registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback: setRefreshSignal,
    isFetchingRef: isOperationInProgressRef,
    refreshInProgressRef: isOperationInProgressRef,
  });

  // Setup auth event listeners and perform initial auth check
  useEffect(() => {
    const unregisterListeners = registerListeners();
    checkAuthAndRefresh();
    return unregisterListeners;
  }, [registerListeners, checkAuthAndRefresh]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      setRefreshSignal();
    }
  }, [isAuthenticated, setRefreshSignal]);

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

  async function fetchUploadedTracks(page = 1, showErrors = true) {
    try {
      const directTokenCheck = ApiTokenService.hasValidApiToken();

      if (!directTokenCheck) {
        setError("Authentication required");
        isOperationInProgressRef.current = false;
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

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
        if (!result.connectivityError) {
          setError(result.error || "Failed to load tracks");
        }
      }
    } catch (error) {
      console.error("Error fetching uploaded tracks:", error);
      const isConnectivityError = handleApiError(error, "/api/library/uploaded");

      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
      } else if (!isConnectivityError) {
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
      if (refreshSignal > 0 && !isOperationInProgressRef.current) {
        isOperationInProgressRef.current = true;
        setCurrentPage(1);
        await fetchUploadedTracks(1);
        isOperationInProgressRef.current = false;
      }
    };

    fetchUploadedTracksAsync();
  }, [refreshSignal]);

  return (
    <UploadedTracksContext.Provider
      value={{
        uploadedTracks,
        postUploadedTrack,
        setRefreshUploadedTracksSignal: setRefreshSignal,
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
