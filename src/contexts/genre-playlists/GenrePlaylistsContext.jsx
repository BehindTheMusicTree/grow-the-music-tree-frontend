import { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

import GenreService from "../../utils/services/GenreService";
import BadRequestError from "../../utils/errors/BadRequestError";
import UnauthorizedRequestError from "../../utils/errors/UnauthorizedRequestError";
import InvalidInputContentObject from "../../models/popup-content-object/InvalidInputContentObject";
import useSpotifyAuth from "../../hooks/useSpotifyAuth";
import SpotifyService from "../../utils/services/SpotifyService";

export const GenrePlaylistsContext = createContext();

function GenrePlaylistsProvider({ children }) {
  const [groupedGenrePlaylists, setGroupedGenrePlaylists] = useState();
  const [refreshGenrePlaylistsSignal, setRefreshGenrePlaylistsSignal] = useState(1);
  const [error, setError] = useState(null);
  const { checkTokenAndShowAuthIfNeeded, hasValidToken } = useSpotifyAuth();

  // Track Spotify auth state directly
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return SpotifyService.hasValidSpotifyToken();
  });

  const areGenrePlaylistsFetchingRef = { current: false };

  // Single source of truth for auth state management
  useEffect(() => {
    const updateAuthState = () => {
      const currentAuthState = SpotifyService.hasValidSpotifyToken();
      setIsAuthenticated(currentAuthState);
      return currentAuthState;
    };

    // Initial check on mount
    updateAuthState();

    // Handle storage changes
    const handleStorageChange = (e) => {
      if (e.key === SpotifyService.SPOTIFY_TOKEN_KEY || e.key === SpotifyService.SPOTIFY_TOKEN_EXPIRY_KEY) {
        updateAuthState();
      }
    };

    // Handle focus changes
    const handleFocus = () => {
      updateAuthState();
    };

    // Set up event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Single effect to handle playlist refresh based on auth state
  useEffect(() => {
    if (isAuthenticated && !areGenrePlaylistsFetchingRef.current) {
      setRefreshGenrePlaylistsSignal((prev) => {
        const newValue = prev + 1;
        return newValue;
      });
    }
  }, [isAuthenticated]);

  const handleGenreAddAction = async (event, parentUuid) => {
    event.stopPropagation();

    // Check for valid Spotify token before API call
    if (!checkTokenAndShowAuthIfNeeded(true)) {
      return false;
    }

    const name = prompt("New genre name:");
    if (!name) {
      return false;
    }

    try {
      await GenreService.postGenre({
        name: name,
        parent: parentUuid,
      });
      setRefreshGenrePlaylistsSignal(1);
      return true;
    } catch (error) {
      // Handle authentication errors
      if (error instanceof UnauthorizedRequestError) {
        checkTokenAndShowAuthIfNeeded(true); // Force showing the auth popup
        return false;
      }
      throw error; // Re-throw other errors
    }
  };

  // Improved fetch function with enhanced error handling and debug info
  const fetchGenrePlaylists = useCallback(async () => {
    // Check token directly to ensure we have the latest state
    const directTokenCheck = SpotifyService.hasValidSpotifyToken();

    try {
      // Double-check token directly to ensure we have the latest state
      if (!directTokenCheck) {
        setError("Authentication required");
        // Don't trigger another refresh when showing auth
        areGenrePlaylistsFetchingRef.current = false;
        setRefreshGenrePlaylistsSignal(0);
        checkTokenAndShowAuthIfNeeded(true);
        return;
      }

      // Include fetch timeout for better error diagnostics
      let fetchTimeoutId;
      const fetchTimeout = new Promise((_, reject) => {
        fetchTimeoutId = setTimeout(() => {
          reject(new Error("Fetch timeout - API request took too long"));
        }, 15000); // 15 second timeout
      });

      // Race between the actual fetch and the timeout
      const genrePlaylists = await Promise.race([GenreService.getGenrePlaylists(), fetchTimeout]);

      // Clear timeout if fetch completed successfully
      clearTimeout(fetchTimeoutId);

      if (genrePlaylists && genrePlaylists.length > 0) {
        const grouped = getGenrePlaylistsGroupedByRoot(genrePlaylists);
        setGroupedGenrePlaylists(grouped);
        setError(null);
      } else {
        setGroupedGenrePlaylists({});
      }
    } catch (error) {
      console.error("[GenrePlaylistsContext] Error fetching genre playlists:", error);

      // Enhanced error handling with more specific error information
      if (error instanceof UnauthorizedRequestError) {
        setError("Authentication required");
        // Don't trigger another refresh when showing auth
        areGenrePlaylistsFetchingRef.current = false;
        setRefreshGenrePlaylistsSignal(0);
        checkTokenAndShowAuthIfNeeded(true);
        // Update auth state since we got an unauthorized error
        setIsAuthenticated(false);
      } else if (error.message?.includes("timeout")) {
        setError("API request timed out - please try again");
      } else if (error.message?.includes("NetworkError") || error.message?.includes("network")) {
        setError("Network error - please check your connection");
      } else {
        setError(`Failed to load genre playlists: ${error.message || "Unknown error"}`);
      }
    } finally {
      areGenrePlaylistsFetchingRef.current = false;
      setRefreshGenrePlaylistsSignal(0);
    }
  }, [checkTokenAndShowAuthIfNeeded, hasValidToken, isAuthenticated]);

  // Enhanced effect with improved fetch error handling and retry logic
  useEffect(() => {
    if (refreshGenrePlaylistsSignal > 0 && !areGenrePlaylistsFetchingRef.current) {
      areGenrePlaylistsFetchingRef.current = true;

      // Track attempts for retry logic
      let attempts = 0;
      const maxAttempts = 2;

      const attemptFetch = () => {
        fetchGenrePlaylists()
          .catch((err) => {
            console.error(`[GenrePlaylistsContext] Fetch error (attempt ${attempts + 1}/${maxAttempts}):`, err);

            // If we have auth but fetch failed, try once more after a delay
            if (attempts < maxAttempts && isAuthenticated) {
              attempts++;
              console.log(`[GenrePlaylistsContext] Retrying fetch in 1 second (attempt ${attempts}/${maxAttempts})`);
              setTimeout(attemptFetch, 1000);
              return; // Don't reset flags yet
            }

            // Only reset if we're done with all attempts
            areGenrePlaylistsFetchingRef.current = false;
            setRefreshGenrePlaylistsSignal(0);
          })
          .then((result) => {
            if (result !== undefined) {
              // Only handle defined results
              console.log("[GenrePlaylistsContext] Fetch completed successfully");
              areGenrePlaylistsFetchingRef.current = false;
              setRefreshGenrePlaylistsSignal(0);
            }
          });
      };

      attemptFetch();
    }
  }, [refreshGenrePlaylistsSignal, fetchGenrePlaylists, isAuthenticated]);

  const getGenrePlaylistsGroupedByRoot = (genrePlaylists) => {
    const groupedGenrePlaylists = {};
    genrePlaylists.forEach((genrePlaylist) => {
      const rootUuid = genrePlaylist.root.uuid;
      if (!groupedGenrePlaylists[rootUuid]) {
        groupedGenrePlaylists[rootUuid] = [];
      }
      groupedGenrePlaylists[rootUuid].push(genrePlaylist);
    });

    return groupedGenrePlaylists;
  };

  const updateGenreParent = async (genreUuid, parentUuid) => {
    await GenreService.putGenre(genreUuid, {
      parent: parentUuid,
    });
    setRefreshGenrePlaylistsSignal(1);
  };

  const renameGenre = async (genreUuid, newName, showPopupCallback) => {
    try {
      // Pass badRequestCatched=true to handle BadRequestError here instead of global handler
      await GenreService.putGenre(
        genreUuid,
        {
          name: newName,
        },
        true
      );
      setRefreshGenrePlaylistsSignal(1);
      return true;
    } catch (error) {
      if (error instanceof BadRequestError) {
        // Use the error directly from API, which already contains field error details
        const popupContentObject = new InvalidInputContentObject(error);

        // Use callback to show popup from the component
        if (showPopupCallback) {
          showPopupCallback(popupContentObject);
        }
        return false;
      }
      throw error; // Rethrow other errors for global handling
    }
  };

  const deleteGenre = async (genreUuid) => {
    await GenreService.deleteGenre(genreUuid);
    setRefreshGenrePlaylistsSignal(1);
  };

  return (
    <GenrePlaylistsContext.Provider
      value={{
        groupedGenrePlaylists,
        handleGenreAddAction,
        setRefreshGenrePlaylistsSignal,
        updateGenreParent,
        renameGenre,
        deleteGenre,
        error, // Include error state in context value
      }}
    >
      {children}
    </GenrePlaylistsContext.Provider>
  );
}

GenrePlaylistsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GenrePlaylistsProvider;
