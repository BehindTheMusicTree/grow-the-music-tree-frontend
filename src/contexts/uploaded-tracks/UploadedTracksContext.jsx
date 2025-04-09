import { createContext, useState, useEffect, useContext } from "react";
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
  const { handleApiError, refreshCallback } = useApiConnectivity({
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

  // Effect to fetch tracks when refreshCallback is triggered
  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      if (!isMounted || isOperationInProgressRef.current) {
        return;
      }

      isOperationInProgressRef.current = true;
      setError(null);
      setLoading(true);

      try {
        const directTokenCheck = ApiTokenService.hasValidApiToken();

        if (!directTokenCheck) {
          setError("Authentication required");
          isOperationInProgressRef.current = false;
          setLoading(false);
          checkTokenAndShowAuthIfNeeded(true);
          return;
        }

        const tracksData = await UploadedTrackService.getUploadedTracks(currentPage, pageSize);
        setUploadedTracks(tracksData.results || []);
        setHasMore(tracksData.has_more || false);
        setError(null);
      } catch (error) {
        console.error("Error fetching tracks:", error);
        const isConnectivityError = handleApiError(error, "/api/library/uploaded");

        if (!isConnectivityError) {
          setError("Failed to load uploaded tracks");
        }

        if (error.status === 401 || error.status === 403) {
          checkTokenAndShowAuthIfNeeded(true);
        }
      } finally {
        isOperationInProgressRef.current = false;
        setLoading(false);
      }
    };

    fetchTracks();

    return () => {
      isMounted = false;
    };
  }, [refreshCallback, currentPage, checkTokenAndShowAuthIfNeeded, handleApiError]);

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
        setRefreshSignal: refreshCallback,
      }}
    >
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUploadedTracks() {
  const context = useContext(UploadedTracksContext);
  if (!context) {
    throw new Error("useUploadedTracks must be used within an UploadedTracksProvider");
  }
  return context;
}
