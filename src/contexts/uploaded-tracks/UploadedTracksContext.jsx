import { createContext, useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

import { UploadedTrackService } from "../../utils/services";
import { useGenrePlaylists } from "../genre-playlists/useGenrePlaylists";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";
import useApiConnectivity from "../../hooks/useApiConnectivity";
import useAuthChangeHandler from "../../hooks/useAuthChangeHandler";
import useAuthState from "../../hooks/useAuthState";
import useSpotifyAuthActions from "../../hooks/useSpotifyAuthActions";
import ApiTokenService from "../../utils/services/ApiTokenService";

export const UploadedTracksContext = createContext();

// Main provider component
function UploadedTracksProvider({ children }) {
  const { setRefreshGenrePlaylistsSignal = () => {} } = useGenrePlaylists() || {};
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [refreshuploadedTracksSignal, setRefreshUploadedTracksSignalRaw] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 50;

  // Use focused hooks for auth state and actions
  const checkTokenAndShowAuthIfNeeded = useSpotifyAuthActions();
  const isAuthenticated = useAuthState();

  // Create proper refs for tracking states
  const areUploadedTrackFetchingRef = useRef(false);
  const refreshInProgressRef = useRef(false);
  const prevAuthStateRef = useRef(isAuthenticated);

  // Create a safe refresh function
  const triggerRefresh = useCallback(() => {
    if (!areUploadedTrackFetchingRef.current && !refreshInProgressRef.current) {
      refreshInProgressRef.current = true;
      setRefreshUploadedTracksSignalRaw((prev) => prev + 1);
      setTimeout(() => {
        refreshInProgressRef.current = false;
      }, 100);
    }
  }, []);

  // Setup API connectivity handling
  const { handleApiError } = useApiConnectivity({
    refreshCallback: triggerRefresh,
    fetchingRef: areUploadedTrackFetchingRef,
    refreshInProgressRef,
  });

  // Setup authentication handling and event listeners
  const { registerListeners, checkAuthAndRefresh } = useAuthChangeHandler({
    refreshCallback: triggerRefresh,
    isFetchingRef: areUploadedTrackFetchingRef,
    refreshInProgressRef: refreshInProgressRef,
  });

  // Setup auth event listeners and perform initial auth check
  useEffect(() => {
    // Register listeners for storage and visibility changes
    const unregisterListeners = registerListeners();

    // Initial auth check and data refresh if needed
    checkAuthAndRefresh();

    return unregisterListeners;
  }, [registerListeners, checkAuthAndRefresh]);

  // React to changes in authentication state
  useEffect(() => {
    // Update the reference to track changes
    prevAuthStateRef.current = isAuthenticated;

    // If user becomes authenticated, trigger data refresh
    if (isAuthenticated && !areUploadedTrackFetchingRef.current && !refreshInProgressRef.current) {
      triggerRefresh();
    }
  }, [isAuthenticated, triggerRefresh]);

  async function postUploadedTrack(file, genreUuid, onProgress, badRequestCatched) {
    // Check for valid Spotify token before API call
    if (!checkTokenAndShowAuthIfNeeded(true)) {
      return { success: false, authRequired: true };
    }

    try {
      await UploadedTrackService.uploadTrack(file, genreUuid, onProgress, badRequestCatched);
      setRefreshGenrePlaylistsSignal(1);
      return { success: true };
    } catch (error) {
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return { success: false, authRequired: true };
      }

      // Handle API connectivity errors
      if (handleApiError(error, "/api/library/uploaded")) {
        return { success: false, connectivityError: true };
      }

      throw error;
    }
  }

  async function fetchUploadedTracks(page = 1, showErrors = true) {
    try {
      // Check token directly to ensure we have the latest state
      const directTokenCheck = ApiTokenService.hasValidApiToken();

      if (!directTokenCheck) {
        setError("Authentication required");
        areUploadedTrackFetchingRef.current = false;
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
        // Only set error if it's not a connectivity error (handled by hook)
        if (!result.connectivityError) {
          setError(result.error || "Failed to load tracks");
        }
      }
    } catch (error) {
      console.error("Error fetching uploaded tracks:", error);

      // Handle API connectivity errors
      const isConnectivityError = handleApiError(error, "/api/library/uploaded");

      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        checkTokenAndShowAuthIfNeeded(true);
      } else if (!isConnectivityError) {
        // Only set generic error if not a connectivity error (already handled by hook)
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
      if (refreshuploadedTracksSignal > 0 && !areUploadedTrackFetchingRef.current) {
        areUploadedTrackFetchingRef.current = true;
        setCurrentPage(1);
        await fetchUploadedTracks(1);
        areUploadedTrackFetchingRef.current = false;
        setRefreshUploadedTracksSignalRaw(0);
      }
    };

    fetchUploadedTracksAsync();
  }, [refreshuploadedTracksSignal]);

  return (
    <UploadedTracksContext.Provider
      value={{
        uploadedTracks,
        postUploadedTrack,
        setRefreshUploadedTracksSignal: triggerRefresh,
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

export { UploadedTracksProvider };
export default UploadedTracksProvider;
