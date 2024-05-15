import PopupContentObject from "./PopupContentObject";

export default class LibTrackUploadingPopupContentObject extends PopupContentObject {
  constructor(file, genreUuid) {
    super("Uploading track");
    this.file = file;
    this.genreUuid = genreUuid;
  }
}
