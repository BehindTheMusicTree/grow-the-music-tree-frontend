import ApiService from "../ApiService";
import SpotifyService from "./SpotifyService";

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
    if (!SpotifyService.hasValidSpotifyToken()) {
      console.warn("No valid Spotify token available - API calls will be queued");
      // Signal auth required but return empty data to prevent UI crashes
      return { results: [], count: 0, authentication_required: true };
    }

    try {
      const data = await ApiService.fetchData(`library/spotify?page=${page}&pageSize=${pageSize}`, "GET");

      // Update sync timestamp on successful data retrieval
      this.updateSyncTimestamp();

      return data;
    } catch (error) {
      console.error("Error fetching Spotify tracks:", error);

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
   * @param {Function} notifyProgress - Callback for progress updates
   * @param {Function} notifySuccess - Callback when sync succeeds
   * @param {Function} notifyError - Callback when sync fails
   */
  static async syncInBackground(notifyStart, notifyProgress, notifySuccess, notifyError) {
    notifyStart && notifyStart();

    try {
      // First check if we have valid token
      if (!SpotifyService.hasValidSpotifyToken()) {
        notifyError && notifyError("Authentication required");
        return;
      }

      // Simulate progress for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          notifyProgress && notifyProgress(progress);
        }
      }, 200);

      // Perform the actual sync
      const data = await this.getLibTracks(1, 50, false);

      // Clean up and notify success
      clearInterval(progressInterval);
      notifyProgress && notifyProgress(100);
      notifySuccess && notifySuccess(data);

      return data;
    } catch (error) {
      notifyError && notifyError(error.message || "Sync failed");
      return null;
    }
  }
}
