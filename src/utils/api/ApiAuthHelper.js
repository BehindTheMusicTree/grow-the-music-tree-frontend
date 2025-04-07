import { DUE_TO_PREVIOUS_ERROR_MESSAGE } from "../constants";
import SpotifyService from "../services/SpotifyService";
import UnauthorizedRequestError from "../errors/UnauthorizedRequestError";

/**
 * Handles API authentication and authorization
 */
export default class ApiAuthHelper {
  /**
   * Gets the authentication token
   */
  static getToken() {
    const token = SpotifyService.getSpotifyToken();
    return token;
  }

  /**
   * Checks if a valid authentication token exists
   */
  static hasValidToken() {
    const hasToken = SpotifyService.hasValidSpotifyToken();
    return hasToken;
  }

  /**
   * Throws an authentication error
   */
  static throwAuthError() {
    console.error("[API] Authentication error: Spotify authentication required");
    throw new UnauthorizedRequestError({
      message: "Spotify authentication required",
      status: 401,
      details: "You must connect with Spotify to access this feature",
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

      const spotifyToken = this.getToken();
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

  /**
   * Gets the Spotify token from local storage
   */
  static async getSpotifyToken() {
    const token = localStorage.getItem(SpotifyService.SPOTIFY_TOKEN_KEY);
    if (!token) {
      throw new UnauthorizedRequestError("No Spotify token found");
    }
    return token;
  }

  /**
   * Generates authorization headers
   */
  static generateHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }
}