import { YoutubePlayerTrack } from "@behindthemusictree/app-kit/player";
import { TrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

// grow only plays reference-tree tracks, which have no self-hosted audio and play via
// YouTube embed instead (see YoutubeTrackDetailedSchema).
export function toPlayerTrack(track: TrackDetailed): YoutubePlayerTrack {
  if (track.kind !== "youtube") {
    throw new Error(`Unexpected non-YouTube track ${track.uuid} — grow only serves reference-tree YouTube tracks`);
  }

  return {
    id: track.uuid,
    kind: "youtube",
    youtubeVideoId: track.youtubeVideoId,
    title: track.title,
    artists: track.artists?.map((artist) => ({ name: artist.name })),
  };
}
