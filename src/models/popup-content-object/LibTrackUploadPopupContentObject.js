import PopupContentObject from "./PopupContentObject";

export default class LibTrackUploadPopupContentObject extends PopupContentObject {
  constructor(files, genreUuid) {
    super("Uploading track");
    this.files = files;
    this.genreUuid = genreUuid;
  }
}
