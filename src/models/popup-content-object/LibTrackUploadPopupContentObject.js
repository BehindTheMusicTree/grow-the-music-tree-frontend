import PopupContentObject from "./PopupContentObject";

export default class LibTrackUploadPopupContentObject extends PopupContentObject {
  constructor(files, genreUuid) {
    super("Uploading track" + (files.length > 0 ? "s" : ""));
    this.files = files;
    this.genreUuid = genreUuid;
  }
}
