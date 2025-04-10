"use client";

import PopupContentObject from "./PopupContentObject";

export default class SpotifyAuthPopupContentObject extends PopupContentObject {
  constructor() {
    super("Spotify Authentication Required", "SpotifyAuthPopupContentObject");
    this.message = "You need to connect your Spotify account to access the application.";
    this.isDismissable = false;
    this.onAuthenticate = () => {
      console.log("onAuthenticate");
    };
  }
}
