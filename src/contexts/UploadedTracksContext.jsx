import { createContext, useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";

import { UploadedTrackService } from "@utils/services";
import UnauthorizedRequestError from "@utils/errors/UnauthorizedRequestError";
import { useGenrePlaylists } from "@contexts/GenrePlaylistsContext";
import useApiConnectivity from "@hooks/useApiConnectivity";
import useAuthState from "@hooks/useAuthState";
import { useAuthenticatedDataRefreshSignal } from "@hooks/useAuthenticatedDataRefreshSignal";

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
  const { triggerRefresh, refreshSignal, setLoading, getLoading } = useAuthenticatedDataRefreshSignal();

  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore] = useState(true);

  const fetchUploadedTracks = useCallback(async () => {
    if (!isAuthenticated) return;
    if (getLoading("uploadedTracks")) return;

    try {
      setLoading("uploadedTracks", true);
      setError(null);
      await checkApiConnectivity();

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
    } finally {
      setLoading("uploadedTracks", false);
    }
  }, [isAuthenticated, checkApiConnectivity, getLoading, setLoading]);

  useEffect(() => {
    fetchUploadedTracks();
  }, [fetchUploadedTracks, refreshSignal]);

  async function postUploadedTrack(file, genreUuid, onProgress, badRequestCatched) {
    try {
      await UploadedTrackService.uploadTrack(file, genreUuid, onProgress, badRequestCatched);
      setRefreshGenrePlaylistsSignal(1);
      triggerRefresh("uploadedTracks");
      return { success: true };
    } catch (error) {
      if (error instanceof UnauthorizedRequestError) {
        return { success: false, authRequired: true };
      }

      throw error;
    }
  }

  return (
    <UploadedTracksContext.Provider
      value={{
        uploadedTracks,
        error,
        loading: getLoading("uploadedTracks"),
        currentPage,
        setCurrentPage,
        hasMore,
        postUploadedTrack,
        refreshUploadedTracks: () => triggerRefresh("uploadedTracks"),
      }}
    >
      {children}
    </UploadedTracksContext.Provider>
  );
}

UploadedTracksProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
