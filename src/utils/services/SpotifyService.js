import ApiService from "../ApiService";

export default class SpotifyService {
  // Keys for localStorage
  static SPOTIFY_TOKEN_KEY = "spotify_auth_token";
  static SPOTIFY_TOKEN_EXPIRY_KEY = "spotify_auth_token_expiry";

  /**
   * Retrieves the Spotify token from localStorage
   * @returns {string|null} The Spotify token or null if not found
   */
  static getSpotifyToken() {
    return localStorage.getItem(this.SPOTIFY_TOKEN_KEY);
  }

  /**
   * Retrieves the Spotify token expiry date from localStorage
   * @returns {Date|null} The Spotify token expiry date or null if not found
   */
  static getSpotifyTokenExpiry() {
    const expiry = localStorage.getItem(this.SPOTIFY_TOKEN_EXPIRY_KEY);
    return expiry ? new Date(parseInt(expiry)) : null;
  }

  /**
   * Checks if the Spotify token is expired
   * @returns {boolean} True if token is expired or missing, false otherwise
   */
  static isSpotifyTokenExpired() {
    const expiryDate = this.getSpotifyTokenExpiry();
    return !expiryDate || expiryDate < new Date();
  }

  /**
   * Checks if there is a valid Spotify token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  static hasValidSpotifyToken() {
    return this.getSpotifyToken() && !this.isSpotifyTokenExpired();
  }

  /**
   * Gets Spotify library tracks
   * @param {number} page - The page number to fetch
   * @param {number} pageSize - The number of items per page
   * @returns {Promise<Object>} The library tracks data
   * @throws {Error} If no valid Spotify token is available
   */
  static async getLibTracks(page = 1, pageSize = 50) {
    // This method now throws an error if there's no valid token
    // The components will catch this and show a popup
    if (!this.hasValidSpotifyToken()) {
      throw new Error("No valid Spotify token available");
    }

    return await ApiService.fetchData(`tracks/spotify?page=${page}&page_size=${pageSize}`, "GET");
  }
}
