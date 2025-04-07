/**
 * Service for Spotify authentication and token management
 * Focused solely on auth, with track functionality moved to SpotifyTracksService
 */

export default class SpotifyTokenService {
  // Keys for localStorage
  static SPOTIFY_TOKEN_KEY = "spotify_auth_token";
  static SPOTIFY_TOKEN_EXPIRY_KEY = "spotify_auth_token_expiry";
  static SPOTIFY_REFRESH_KEY = "spotify_refresh_token";
  static SPOTIFY_SYNC_TIMESTAMP_KEY = "spotify_last_sync_timestamp";
  static SPOTIFY_PROFILE_KEY = "spotify_profile";

  // Cache token validity for 1 second to prevent redundant checks
  static _lastTokenCheck = { time: 0, result: false };

  /**
   * Retrieves the Spotify token from localStorage
   * @returns {string|null} The Spotify token or null if not found
   */
  static getSpotifyToken() {
    return localStorage.getItem(this.SPOTIFY_TOKEN_KEY);
  }

  /**
   * Saves a Spotify token to localStorage
   * @param {string} token - The Spotify access token
   * @param {number} expiresIn - Token lifetime in seconds
   * @param {string} refreshToken - The refresh token (optional)
   * @param {object} profile - The Spotify user profile (optional)
   */
  static saveSpotifyToken(token, expiresIn, refreshToken = null, profile = null) {
    if (!token) return;

    // Save token
    localStorage.setItem(this.SPOTIFY_TOKEN_KEY, token);

    // Calculate and save expiry time
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
    localStorage.setItem(this.SPOTIFY_TOKEN_EXPIRY_KEY, expiryTime.getTime().toString());

    // Save refresh token if provided
    if (refreshToken) {
      localStorage.setItem(this.SPOTIFY_REFRESH_KEY, refreshToken);
    }

    // Save profile if provided
    if (profile) {
      localStorage.setItem(this.SPOTIFY_PROFILE_KEY, JSON.stringify(profile));
    }
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

    // Token is expired if expiry date is missing or in the past
    // Add 60 seconds buffer to prevent edge cases
    if (!expiryDate) return true;

    const now = new Date();
    now.setSeconds(now.getSeconds() + 60); // Buffer
    return expiryDate < now;
  }

  /**
   * Checks if there is a valid Spotify token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  static hasValidSpotifyToken() {
    const now = Date.now();
    // Return cached result if checked within last second
    if (now - this._lastTokenCheck.time < 1000) {
      return this._lastTokenCheck.result;
    }

    const token = this.getSpotifyToken();
    if (!token) {
      this._lastTokenCheck = { time: now, result: false };
      return false;
    }

    const isValid = !this.isSpotifyTokenExpired();
    this._lastTokenCheck = { time: now, result: isValid };
    return isValid;
  }

  /**
   * Updates the last sync timestamp
   * Used to track when data was last synchronized with Spotify
   */
  static updateSyncTimestamp() {
    const now = new Date();
    localStorage.setItem(this.SPOTIFY_SYNC_TIMESTAMP_KEY, now.getTime().toString());
    console.log("[SpotifyService] Updated sync timestamp:", now.toISOString());
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
   * Clears all Spotify authentication data
   * Used for logout or when auth is invalid
   */
  static clearSpotifyAuth() {
    localStorage.removeItem(this.SPOTIFY_TOKEN_KEY);
    localStorage.removeItem(this.SPOTIFY_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.SPOTIFY_REFRESH_KEY);
    localStorage.removeItem(this.SPOTIFY_PROFILE_KEY);
  }

  static async getUserProfile() {
    try {
      const token = this.getSpotifyToken();
      if (!token) {
        throw new Error("No Spotify token available");
      }

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Spotify profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching Spotify profile:", error);
      throw error;
    }
  }

  static getSpotifyProfile() {
    const profileStr = localStorage.getItem(this.SPOTIFY_PROFILE_KEY);
    return profileStr ? JSON.parse(profileStr) : null;
  }
}
