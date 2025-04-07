import ApiService from "@utils/ApiService";
import SpotifyTokenService from "@utils/services/SpotifyTokenService";

/**
 * Service for fetching and managing Spotify tracks
 * Separates track functionality from authentication
 */
export default class SpotifyTracksService {
  static SPOTIFY_SYNC_TIMESTAMP_KEY = "spotify_last_sync_timestamp";

  /**
   * Updates the last sync timestamp
   * Used to track when data was last synchronized with Spotify
   */
  static updateSyncTimestamp() {
    localStorage.setItem(this.SPOTIFY_SYNC_TIMESTAMP_KEY, new Date().getTime().toString());
  }

  /**
   * Gets the last sync timestamp
   * @returns {Date|null} The last sync timestamp or null if never synced
   */
  static getLastSyncTimestamp() {
    const timestamp = localStorage.getItem(this.SPOTIFY_SYNC_TIMESTAMP_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  /**
   * Gets Spotify library tracks with background operation support
   * @param {number} page - The page number to fetch
   * @param {number} pageSize - The number of items per page
   * @param {boolean} showErrors - Whether to show errors to the user
   * @returns {Promise<Object>} The library tracks data
   */
  static async getLibTracks(page = 1, pageSize = 50, showErrors = true) {
    // Check token but don't throw - background operations will handle auth gracefully
    if (!SpotifyTokenService.hasValidSpotifyToken()) {
      // Signal auth required but return empty data to prevent UI crashes
      return { results: [], count: 0, authentication_required: true };
    }

    try {
      const data = await ApiService.fetchData(`library/spotify?page=${page}&pageSize=${pageSize}`, "GET");

      // Update sync timestamp on successful data retrieval
      this.updateSyncTimestamp();

      return data;
    } catch (error) {
      if (showErrors) {
        // Signal auth required if appropriate
        if (error.statusCode === 401) {
          return { results: [], count: 0, authentication_required: true };
        }
      }

      // Rethrow for components that want to handle errors directly
      throw error;
    }
  }

  /**
   * Initiates a background sync with Spotify
   * Non-blocking operation with status notifications
   * @param {Function} notifyStart - Callback when sync starts
   * @param {Function} notifySuccess - Callback when sync succeeds
   * @param {Function} notifyError - Callback when sync fails
   */
  static async syncInBackground(notifyStart, notifySuccess, notifyError) {
    if (notifyStart) notifyStart();

    try {
      // First check if we have valid token
      if (!SpotifyTokenService.hasValidSpotifyToken()) {
        if (notifyError) notifyError("Authentication required");
        return;
      }

      // Perform the actual sync
      const data = await this.getLibTracks(1, 50, false);
      if (notifySuccess) notifySuccess(data);

      return data;
    } catch (error) {
      if (notifyError) notifyError(error.message || "Sync failed");
      return null;
    }
  }

  static async quickSync(notifyStart, notifySuccess, notifyError) {
    if (notifyStart) notifyStart();

    try {
      // First check if we have valid token
      if (!SpotifyTokenService.hasValidSpotifyToken()) {
        if (notifyError) notifyError("Authentication required");
        return;
      }

      // Perform the actual sync
      const response = await ApiService.fetchData("library/spotify/sync/quick/", "POST");
      if (notifySuccess) notifySuccess(response);

      return response;
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes("Operation conflict")) {
        if (notifyError) notifyError("A sync is already in progress. Please wait for it to complete.");
      } else {
        if (notifyError) notifyError(error.message || "Sync failed");
      }

      return null;
    }
  }

  static async getTrackDetails(trackId) {
    try {
      const response = await ApiService.get(`/spotify/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      throw error;
    }
  }

  static async getTrackFeatures(trackId) {
    try {
      const response = await ApiService.get(`/spotify/tracks/${trackId}/features`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      throw error;
    }
  }

  static async getTrackAnalysis(trackId) {
    try {
      const response = await ApiService.get(`/spotify/tracks/${trackId}/analysis`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      throw error;
    }
  }

  static async getTrackRecommendations(trackId) {
    try {
      const response = await ApiService.get(`/spotify/tracks/${trackId}/recommendations`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Authentication required");
      }
      throw error;
    }
  }
}
