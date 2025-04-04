import PopupContentObject from "./PopupContentObject";

export default class TrackUploadPopupContentObject extends PopupContentObject {
  constructor(files, genreUuid) {
    super("Uploading track" + (files.length > 0 ? "s" : ""), "TrackUploadPopupContentObject");
    this.files = files;
    this.genreUuid = genreUuid;
  }
}
