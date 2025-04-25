import { UploadedTrackDetailed } from "@schemas/uploaded-track";
import { PlaylistDetailed } from "@schemas/playlist";
import { TrackListOriginType } from "./TrackListOriginType";

export default class TrackListOrigin {
  constructor(public type: TrackListOriginType, public object: UploadedTrackDetailed | PlaylistDetailed) {}
}
