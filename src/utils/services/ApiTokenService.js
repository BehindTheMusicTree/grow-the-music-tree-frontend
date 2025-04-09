/**
 * Service for API authentication and token management
 * Focused solely on auth, with track functionality moved to spotifyLibTracksService
 */

export default class ApiTokenService {
  // Keys for localStorage
  static API_TOKEN_KEY = "api_auth_token";
  static API_TOKEN_EXPIRY_KEY = "api_auth_token_expiry";
  static API_REFRESH_KEY = "api_refresh_token";
  static API_SYNC_TIMESTAMP_KEY = "api_last_sync_timestamp";
  static API_PROFILE_KEY = "api_profile";

  // Cache token validity for 1 second to prevent redundant checks
  static _lastTokenCheck = { time: 0, result: false };

  /**
   * Retrieves the API token from localStorage
   * @returns {string|null} The API token or null if not found
   */
  static getApiToken() {
    const token = localStorage.getItem(this.API_TOKEN_KEY);
    console.log("[ApiTokenService] Token retrieved:", { exists: !!token, length: token?.length });
    return token;
  }

  /**
   * Saves an API token to localStorage
   * @param {string} token - The API access token
   * @param {number} expiresIn - Token lifetime in seconds
   * @param {string} refreshToken - The refresh token (optional)
   * @param {object} profile - The user profile (optional)
   */
  static saveApiToken(token, expiresIn, refreshToken = null, profile = null) {
    if (!token) return;

    // Save token
    localStorage.setItem(this.API_TOKEN_KEY, token);

    // Calculate and save expiry time
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expiresIn);
    localStorage.setItem(this.API_TOKEN_EXPIRY_KEY, expiryTime.getTime().toString());

    // Save refresh token if provided
    if (refreshToken) {
      localStorage.setItem(this.API_REFRESH_KEY, refreshToken);
    }

    // Save profile if provided
    if (profile) {
      localStorage.setItem(this.API_PROFILE_KEY, JSON.stringify(profile));
    }
  }

  /**
   * Retrieves the API token expiry date from localStorage
   * @returns {Date|null} The API token expiry date or null if not found
   */
  static getApiTokenExpiry() {
    const expiry = localStorage.getItem(this.API_TOKEN_EXPIRY_KEY);
    return expiry ? new Date(parseInt(expiry)) : null;
  }

  /**
   * Checks if the API token is expired
   * @returns {boolean} True if token is expired or missing, false otherwise
   */
  static isApiTokenExpired() {
    const expiryDate = this.getApiTokenExpiry();

    // Token is expired if expiry date is missing or in the past
    // Add 60 seconds buffer to prevent edge cases
    if (!expiryDate) return true;

    const now = new Date();
    now.setSeconds(now.getSeconds() + 60); // Buffer
    return expiryDate < now;
  }

  /**
   * Checks if there is a valid API token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  static hasValidApiToken() {
    const token = this.getApiToken();
    const isValid = !!token;
    console.log("[ApiTokenService hasValidApiToken] Token validity check:", { isValid, exists: !!token });
    return isValid;
  }

  /**
   * Updates the last sync timestamp
   * Used to track when data was last synchronized
   */
  static updateSyncTimestamp() {
    const now = new Date();
    localStorage.setItem(this.API_SYNC_TIMESTAMP_KEY, now.getTime().toString());
  }

  /**
   * Gets the last sync timestamp
   * @returns {Date|null} The last sync timestamp or null if not found
   */
  static getLastSyncTimestamp() {
    const timestamp = localStorage.getItem(this.API_SYNC_TIMESTAMP_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  /**
   * Clears all API auth data from localStorage
   */
  static clearApiAuth() {
    localStorage.removeItem(this.API_TOKEN_KEY);
    localStorage.removeItem(this.API_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.API_REFRESH_KEY);
    localStorage.removeItem(this.API_SYNC_TIMESTAMP_KEY);
    localStorage.removeItem(this.API_PROFILE_KEY);
  }

  /**
   * Gets the stored user profile
   * @returns {object|null} The user profile or null if not found
   */
  static getApiProfile() {
    const profile = localStorage.getItem(this.API_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  }

  /**
   * Ensures a valid API token exists
   * @throws {Error} If no valid token is available
   */
  static ensureValidToken() {
    const token = this.getApiToken();
    if (!token || this.isApiTokenExpired()) {
      throw new Error("No API token available");
    }
  }
}
