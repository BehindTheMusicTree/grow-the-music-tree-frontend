"use client";

import PopupContentObject from "./PopupContentObject";

export default class SpotifyAccountPopupContentObject extends PopupContentObject {
  constructor(profile) {
    super("Spotify Account", "SpotifyAccountPopupContentObject");
    this.profile = profile;
    this.message = "Your Spotify account details";
  }
}
