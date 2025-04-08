import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../constants";
import ApiTokenService from "../services/ApiTokenService";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";

/**
 * Helper class for API authentication management
 * Handles token retrieval, validation, and header generation
 */
export default class ApiAuthHelper {
  /**
   * Gets the API token from storage
   * @returns {string|null} The API token or null if not found
   */
  static getApiToken() {
    console.log("[ApiAuthHelper] Getting API token");
    const token = ApiTokenService.getApiToken();
    return token;
  }

  /**
   * Checks if a valid API token exists
   * @returns {boolean} True if a valid token exists, false otherwise
   */
  static hasValidApiToken() {
    const isValid = ApiTokenService.hasValidApiToken();
    return isValid;
  }

  /**
   * Generates headers for API requests
   * @param {string} token - The API token
   * @returns {Object} Headers object for API requests
   */
  static generateHeaders(token = null) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const apiToken = this.getApiToken();
      if (apiToken) {
        headers.Authorization = `Bearer ${apiToken}`;
      }
    }

    return headers;
  }

  /**
   * Ensures a valid API token exists
   * @throws {Error} If no valid token is available
   */
  static ensureValidToken() {
    const token = this.getApiToken();
    if (!token) {
      throw new Error("No API token available");
    }
  }

  /**
   * Throws an authentication error
   */
  static throwAuthError() {
    console.log("[ApiAuthHelper] Throwing auth error");
    throw new UnauthorizedRequestError({
      message: "Spotify authentication required",
      details: {
        type: "spotify_auth_required",
        message: "Please authenticate with Spotify to continue",
      },
    });
  }

  /**
   * Gets authentication headers
   */
  static async getHeaders() {
    console.log("[ApiAuthHelper] Getting headers");
    if (!this.hasValidApiToken()) {
      console.log("[ApiAuthHelper] No valid token, throwing error");
      this.throwAuthError();
    }

    const token = this.getApiToken();
    console.log("[ApiAuthHelper] Token obtained for headers");
    return this.generateHeaders(token);
  }
}
