import PopupContentObject from "./PopupContentObject";

export default class UploadedTrackEditionPopupContentObject extends PopupContentObject {
  constructor(uploadedTrack, handleUpdatedUploadedTrack) {
    super("Edit track", "UploadedTrackEditionPopupContentObject");
    this.uploadedTrack = uploadedTrack;
    this.handleUpdatedUploadedTrack = handleUpdatedUploadedTrack;
  }
}
