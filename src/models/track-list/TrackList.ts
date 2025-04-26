import { UploadedTrackDetailed } from "@schemas/uploaded-track/response";
import TrackListOrigin, {
  TrackListOriginFromUploadedTrack,
  TrackListOriginFromPlaylist,
} from "./origin/TrackListOrigin";

export default class TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOrigin) {}
}

export class TrackListFromUploadedTrack extends TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOriginFromUploadedTrack) {
    super(uploadedTracks, origin);
  }
}

export class TrackListFromPlaylist extends TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOriginFromPlaylist) {
    super(uploadedTracks, origin);
  }
}
