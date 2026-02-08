import { PlaylistDetailed } from "@schemas/domain/playlist/detailed";
import { CriteriaPlaylistDetailed } from "@schemas/domain/playlist/criteria-playlist/detailed";
import { UploadedTrackDetailed } from "@schemas/domain/uploaded-track/response/detailed";
import { Scope } from "@app-types/Scope";
import { TrackListOriginType } from "./TrackListOriginType";

export default class TrackListOrigin {
  constructor(
    public type: TrackListOriginType,
    public label: string,
    public uuid: string,
    public scope: Scope,
  ) {}
}

export class TrackListOriginFromUploadedTrack extends TrackListOrigin {
  constructor(public uploadedTrack: UploadedTrackDetailed, scope: Scope) {
    super(
      TrackListOriginType.UPLOADED_TRACK,
      `${uploadedTrack.title} by ${
        uploadedTrack.artists ? uploadedTrack.artists.map((artist) => artist.name).join(", ") : ""
      }`,
      uploadedTrack.uuid,
      scope,
    );
  }
}

export class TrackListOriginFromPlaylist extends TrackListOrigin {
  constructor(public playlist: PlaylistDetailed, scope: Scope) {
    super(TrackListOriginType.PLAYLIST, playlist.name, playlist.uuid, scope);
  }
}

export class TrackListOriginFromCriteriaPlaylist extends TrackListOrigin {
  constructor(public criteriaPlaylist: CriteriaPlaylistDetailed, scope: Scope) {
    super(TrackListOriginType.GENRE_PLAYLIST, criteriaPlaylist.name, criteriaPlaylist.uuid, scope);
  }
}
