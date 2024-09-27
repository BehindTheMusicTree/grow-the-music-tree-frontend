import PopupContentObject from "./PopupContentObject";

export default class LibTrackEditionPopupContentObject extends PopupContentObject {
  constructor(libTrack, handleUpdatedLibTrack) {
    super("Edit track", "LibTrackEditionPopupContentObject");
    this.libTrack = libTrack;
    this.handleUpdatedLibTrack = handleUpdatedLibTrack;
  }
}
