import { UploadedTrackDetailed } from "@schemas/uploaded-track";
import { PlaylistDetailed } from "@schemas/playlist";

export default class TrackList {
  constructor(
    public uploadedTracks: UploadedTrackDetailed[],
    public origin: UploadedTrackDetailed | PlaylistDetailed
  ) {}
}
