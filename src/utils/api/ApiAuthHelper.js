import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../constants";
import SpotifyTokenService from "../services/SpotifyTokenService";
import UnauthorizedRequestError from "./errors/UnauthorizedRequestError";

/**
 * Helper class for API authentication management
 * Handles token retrieval, validation, and header generation
 */
export default class ApiAuthHelper {
  /**
   * Gets the Spotify token from storage
   * @throws UnauthorizedRequestError if no token is found
   */
  static getSpotifyToken() {
    const token = SpotifyTokenService.getSpotifyToken();
    if (!token) {
      throw new UnauthorizedRequestError("No Spotify token found");
    }
    return token;
  }

  /**
   * Checks if a valid Spotify token exists
   */
  static hasValidToken() {
    return SpotifyTokenService.hasValidSpotifyToken();
  }

  /**
   * Generates headers with authentication token
   */
  static generateHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Throws an authentication error
   */
  static throwAuthError() {
    console.error("[API] Authentication error: Spotify authentication required");
    throw new UnauthorizedRequestError({
      message: "Spotify authentication required",
      status: 401,
      details: "You must connect with Spotify to use this feature",
    });
  }

  /**
   * Gets authentication headers
   */
  static async getHeaders() {
    try {
      if (!this.hasValidToken()) {
        this.throwAuthError();
      }

      const spotifyToken = this.getSpotifyToken();
      const headers = {
        Authorization: `Bearer ${spotifyToken}`,
        "Content-Type": "application/json",
      };
      return headers;
    } catch (error) {
      console.error("[API] Failed to get headers:", error);
      throw new Error(`Failed to get headers. ${DUE_TO_PREVIOUS_ERROR_MESSAGE} ${error.message}`);
    }
  }
}
