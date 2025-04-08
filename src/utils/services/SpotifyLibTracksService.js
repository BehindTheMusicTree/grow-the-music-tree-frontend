import ApiService from "../api/ApiService";

/**
 * Service for fetching and managing Spotify tracks
 * Separates track functionality from authentication
 */
export default class SpotifyLibTracksService {
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
  static async listSpotifyLibTracks(page = 1, pageSize = 50, showErrors = true) {
    try {
      // Let ApiService handle auth, but with a custom catch for graceful background operations
      const data = await ApiService.fetchData(
        `library/spotify?page=${page}&pageSize=${pageSize}`,
        "GET",
        null,
        null,
        null,
        false,
        true
      );

      // Update sync timestamp on successful data retrieval
      this.updateSyncTimestamp();

      return data;
    } catch (error) {
      // Special handling for background operations - don't show errors if not needed
      if (error.name === "UnauthorizedRequestError" || error.statusCode === 401) {
        return { results: [], count: 0, authentication_required: true };
      }

      // Only show other errors if explicitly requested
      if (!showErrors) {
        console.log("[SpotifyLibTracksService] Suppressing error:", error.message);
        return { results: [], count: 0, error: error.message };
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
      const data = await this.listSpotifyLibTracks(1, 50, false);

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
      // Let ApiService handle auth checks
      const response = await ApiService.fetchData("library/spotify/sync/quick/", "POST", null, null, null, false, true);

      if (notifySuccess) notifySuccess(response);
      return response;
    } catch (error) {
      // Keep special handling for Operation conflict errors
      if (error.message && error.message.includes("Operation conflict")) {
        if (notifyError) notifyError("A sync is already in progress. Please wait for it to complete.");
      } else if (error.name === "UnauthorizedRequestError") {
        // Auth errors
        if (notifyError) notifyError("Authentication required");
      } else {
        // Other errors
        if (notifyError) notifyError(error.message || "Sync failed");
      }

      return null;
    }
  }

  static async getTrackDetails(trackId) {
    // Use ApiService's centralized authentication check
    const response = await ApiService.get(`/spotify/tracks/${trackId}`, {}, false, true);
    return response.data;
  }

  static async getTrackFeatures(trackId) {
    // Use ApiService's centralized authentication check
    const response = await ApiService.get(`/spotify/tracks/${trackId}/features`, {}, false, true);
    return response.data;
  }

  static async getTrackAnalysis(trackId) {
    // Use ApiService's centralized authentication check
    const response = await ApiService.get(`/spotify/tracks/${trackId}/analysis`, {}, false, true);
    return response.data;
  }

  static async getTrackRecommendations(trackId) {
    // Use ApiService's centralized authentication check
    const response = await ApiService.get(`/spotify/tracks/${trackId}/recommendations`, {}, false, true);
    return response.data;
  }
}
