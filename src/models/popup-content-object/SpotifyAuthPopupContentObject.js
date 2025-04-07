import PopupContentObject from "./PopupContentObject";
import SpotifyOAuthService from "../../utils/services/SpotifyOAuthService";

export default class SpotifyAuthPopupContentObject extends PopupContentObject {
  constructor() {
    super("Spotify Authentication Required", "SpotifyAuthPopupContentObject");
    this.message = "You need to connect your Spotify account to access this feature.";
    this.isDismissable = false;
    this.onAuthenticate = () => {
      SpotifyOAuthService.initiateLogin();
    };
  }
}
