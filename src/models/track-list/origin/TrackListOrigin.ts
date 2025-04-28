import { UploadedTrackDetailed } from "@domain/uploaded-track/response";
import { PlaylistDetailed } from "@schemas/domain/playlist/detailed";
import { TrackListOriginType } from "./TrackListOriginType";

export default class TrackListOrigin {
  constructor(public type: TrackListOriginType, public label: string, public uuid: string) {}
}

export class TrackListOriginFromUploadedTrack extends TrackListOrigin {
  constructor(public uploadedTrack: UploadedTrackDetailed) {
    super(
      TrackListOriginType.UPLOADED_TRACK,
      `${uploadedTrack.title} by ${
        uploadedTrack.artists ? uploadedTrack.artists.map((artist) => artist.name).join(", ") : ""
      }`,
      uploadedTrack.uuid
    );
  }
}

export class TrackListOriginFromPlaylist extends TrackListOrigin {
  constructor(public playlist: PlaylistDetailed) {
    super(TrackListOriginType.PLAYLIST, playlist.name, playlist.uuid);
  }
}
