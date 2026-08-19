import { YoutubePlayerTrack } from "@behindthemusictree/app-kit/player";
import { YoutubeTrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

// grow only plays reference-tree tracks, which have no self-hosted audio and play via
// YouTube embed instead (see YoutubeTrackDetailedSchema).
export function toPlayerTrack(track: YoutubeTrackDetailed): YoutubePlayerTrack {
  return {
    id: track.uuid,
    kind: "youtube",
    youtubeVideoId: track.youtubeVideoId,
    title: track.title,
    artists: track.artists?.map((artist) => ({ name: artist.name })),
  };
}
