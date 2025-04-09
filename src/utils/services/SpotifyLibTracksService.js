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
  static async listSpotifyLibTracks(page = 1, pageSize = 50) {
    const data = await ApiService.fetchData(
      `library/spotify?page=${page}&pageSize=${pageSize}`,
      "GET",
      null,
      null,
      null,
      false,
      true
    );

    this.updateSyncTimestamp();

    return data;
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
      const response = await ApiService.fetchData("library/spotify/sync/quick/", "POST", null, null, null, false, true);

      if (notifySuccess) notifySuccess(response);
      return response;
    } catch (error) {
      // Special handling for Operation conflict errors
      if (error.message && error.message.includes("Operation conflict")) {
        if (notifyError) notifyError("A sync is already in progress. Please wait for it to complete.");
      } else {
        // Other errors
        if (notifyError) notifyError(error.message || "Sync failed");
      }
    }
  }

  static async getTrackDetails(trackId) {
    const response = await ApiService.get(`/spotify/tracks/${trackId}`, {}, false, true);
    return response.data;
  }
}
