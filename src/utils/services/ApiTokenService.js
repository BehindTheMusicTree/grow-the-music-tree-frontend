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
   * Checks if the code is running in a browser environment
   * @returns {boolean} True if running in browser, false otherwise
   */
  static isBrowser() {
    return typeof window !== "undefined";
  }

  /**
   * Retrieves the API token from localStorage
   * @returns {string|null} The API token or null if not found
   */
  static getApiToken() {
    if (!this.isBrowser()) return null;
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
    if (!this.isBrowser() || !token) return;

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
   * Retrieves the API token expiry time from localStorage
   * @returns {number|null} The expiry time in milliseconds or null if not found
   */
  static getApiTokenExpiry() {
    if (!this.isBrowser()) return null;
    const expiry = localStorage.getItem(this.API_TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry) : null;
  }

  /**
   * Checks if the API token is expired
   * @returns {boolean} True if expired or not found, false otherwise
   */
  static isApiTokenExpired() {
    if (!this.isBrowser()) return true;
    const expiry = this.getApiTokenExpiry();
    if (!expiry) return true;

    const now = new Date().getTime();
    return now >= expiry;
  }

  /**
   * Checks if there is a valid API token
   * @returns {boolean} True if valid token exists, false otherwise
   */
  static hasValidApiToken() {
    if (!this.isBrowser()) return false;

    // Check cache first
    const now = Date.now();
    if (now - this._lastTokenCheck.time < 1000) {
      return this._lastTokenCheck.result;
    }

    const token = this.getApiToken();
    const isValid = !!token && !this.isApiTokenExpired();

    // Update cache
    this._lastTokenCheck = { time: now, result: isValid };
    return isValid;
  }

  /**
   * Updates the last sync timestamp in localStorage
   */
  static updateSyncTimestamp() {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.API_SYNC_TIMESTAMP_KEY, Date.now().toString());
  }

  /**
   * Retrieves the last sync timestamp from localStorage
   * @returns {number|null} The timestamp in milliseconds or null if not found
   */
  static getLastSyncTimestamp() {
    if (!this.isBrowser()) return null;
    const timestamp = localStorage.getItem(this.API_SYNC_TIMESTAMP_KEY);
    return timestamp ? parseInt(timestamp) : null;
  }

  /**
   * Clears all API authentication data from localStorage
   */
  static clearApiAuth() {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.API_TOKEN_KEY);
    localStorage.removeItem(this.API_TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.API_REFRESH_KEY);
    localStorage.removeItem(this.API_SYNC_TIMESTAMP_KEY);
    localStorage.removeItem(this.API_PROFILE_KEY);
  }

  /**
   * Retrieves the API profile from localStorage
   * @returns {object|null} The user profile or null if not found
   */
  static getApiProfile() {
    if (!this.isBrowser()) return null;
    const profile = localStorage.getItem(this.API_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  }

  /**
   * Ensures the API token is valid, refreshing if necessary
   * @returns {Promise<boolean>} True if token is valid, false otherwise
   */
  static async ensureValidToken() {
    if (!this.isBrowser()) return false;
    if (this.hasValidApiToken()) return true;

    const refreshToken = localStorage.getItem(this.API_REFRESH_KEY);
    if (!refreshToken) return false;

    // TODO: Implement token refresh logic
    return false;
  }
}
