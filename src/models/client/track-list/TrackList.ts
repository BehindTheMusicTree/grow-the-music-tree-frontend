import { UploadedTrackDetailed } from "@domain/uploaded-track";
import TrackListOrigin from "./TrackListOrigin";
export default class TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOrigin) {}
}
