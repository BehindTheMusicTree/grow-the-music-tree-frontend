/**
 * Service for Spotify authentication and token management
 * Focused solely on auth, with track functionality moved to SpotifyTracksService
 */

// Log any saved tokens on service initialization to help diagnose auth issues
(function logTokensOnStartup() {
  console.log("=== SPOTIFY AUTH DIAGNOSTICS ===");
  const token = localStorage.getItem("spotify_auth_token");
  const expiry = localStorage.getItem("spotify_auth_token_expiry");
  const refreshToken = localStorage.getItem("spotify_refresh_token");

  console.log("Spotify token available:", !!token);

  if (token) {
    const expiryDate = expiry ? new Date(parseInt(expiry)) : null;
    const now = new Date();
    const isExpired = expiryDate && expiryDate < now;

    console.log("Token expiry:", expiryDate ? expiryDate.toISOString() : "Not set");
    console.log("Token expired:", isExpired);
    console.log("Refresh token available:", !!refreshToken);

    if (expiryDate) {
      const timeUntilExpiry = Math.round((expiryDate.getTime() - now.getTime()) / 1000);
      console.log("Time until expiration:", timeUntilExpiry > 0 ? timeUntilExpiry + " seconds" : "Already expired");
    }
  } else {
    console.log("No Spotify token found - API calls requiring authentication will fail");
  }
  console.log("============================");
})();
export default class SpotifyService {
  // Keys for localStorage
  static SPOTIFY_TOKEN_KEY = "spotify_auth_token";
  static SPOTIFY_TOKEN_EXPIRY_KEY = "spotify_auth_token_expiry";
  static SPOTIFY_REFRESH_KEY = "spotify_refresh_token";
  static SPOTIFY_SYNC_TIMESTAMP_KEY = "spotify_last_sync_timestamp";
  static SPOTIFY_PROFILE_KEY = "spotify_profile";

  // Debug flag to control log verbosity
  static DEBUG_TOKEN_VALIDATION = false;

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
   * @param {object} user - The Spotify user profile (optional)
   */
  static saveSpotifyToken(token, expiresIn, refreshToken = null, user = null) {
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
    if (user) {
      const profile = {
        display_name: user.displayName,
        email: user.email,
        external_urls: user.externalUrls,
        followers: user.followers,
        href: user.href,
        id: user.spotifyId,
        images: user.images,
        type: user.type,
        uri: user.uri,
      };
      localStorage.setItem(this.SPOTIFY_PROFILE_KEY, JSON.stringify(profile));
    }

    console.log("[SpotifyService] Token saved, expires at:", expiryTime.toISOString());
    console.log("[SpotifyService] Token lifetime:", expiresIn, "seconds");
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
    const isExpired = expiryDate < now;

    if (isExpired) {
      console.log("[SpotifyService] Token expired at:", expiryDate.toISOString());
    }

    return isExpired;
  }

  /**
   * Checks if there is a valid Spotify token
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  static hasValidSpotifyToken() {
    if (this.DEBUG_TOKEN_VALIDATION) {
      console.log("[SpotifyService] Checking token validity at:", new Date().toISOString());
    }

    const token = this.getSpotifyToken();
    if (!token) {
      if (this.DEBUG_TOKEN_VALIDATION) {
        console.log("[SpotifyService] No token found");
      }
      return false;
    }

    const isValid = !this.isSpotifyTokenExpired();

    // Only log on state changes or in debug mode
    if (this.DEBUG_TOKEN_VALIDATION) {
      console.log("[SpotifyService] Token valid:", isValid);
    }

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
    console.log("[SpotifyService] Spotify authentication cleared at:", new Date().toISOString());
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
