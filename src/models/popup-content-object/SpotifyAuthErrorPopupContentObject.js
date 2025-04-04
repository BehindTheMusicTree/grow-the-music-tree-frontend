import PopupContentObject from "./PopupContentObject";
import SpotifyAuthService from "../../utils/services/SpotifyAuthService";

/**
 * Popup content object for Spotify authentication errors
 * This popup is non-dismissable, forcing the user to authenticate with Spotify
 */
export default class SpotifyAuthErrorPopupContentObject extends PopupContentObject {
  constructor(errorDetails = {}) {
    super();
    this.title = "Spotify Authentication Required";
    this.type = "spotify-auth-error";
    this.message = errorDetails.message || "You need to connect with Spotify to use this application";
    this.details = errorDetails.details || "Authentication is required to access this feature";
    this.isDismissable = false;
    this.authService = SpotifyAuthService;
  }

  /**
   * Initiates the Spotify login process
   */
  initiateLogin() {
    this.authService.initiateLogin();
  }
}