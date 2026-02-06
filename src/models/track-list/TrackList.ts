import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";
import TrackListOrigin, {
  TrackListOriginFromUploadedTrack,
  TrackListOriginFromPlaylist,
  TrackListOriginFromCriteriaPlaylist,
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

export class TrackListFromCriteriaPlaylist extends TrackList {
  constructor(public uploadedTracks: UploadedTrackDetailed[], public origin: TrackListOriginFromCriteriaPlaylist) {
    super(uploadedTracks, origin);
  }
}
