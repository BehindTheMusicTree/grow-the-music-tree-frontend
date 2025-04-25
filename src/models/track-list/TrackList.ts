import { UploadedTrackDetailed } from "@schemas/uploaded-track";
import TrackListOrigin from "./origin/TrackListOrigin";

export default class TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOrigin) {}
}
