import { YoutubePlayerTrack } from "@behindthemusictree/app-kit/player";
import { RecordingDetailed } from "@behindthemusictree/app-kit/genre-tree";

// grow only plays reference-tree recordings, which have no self-hosted audio and play via
// YouTube embed instead. A recording without a video must never reach the player: its
// next/previous skip only honours unplayableReason, so an empty video id would be "played".
export function toPlayerTrack(recording: RecordingDetailed): YoutubePlayerTrack {
  if (!recording.youtubeVideo) {
    throw new Error(`Recording ${recording.uuid} has no YouTube video`);
  }
  return {
    id: recording.uuid,
    kind: "youtube",
    youtubeVideoId: recording.youtubeVideo.id,
    title: recording.title,
    artists: recording.artists?.map((artist) => ({ uuid: artist.uuid, name: artist.name })),
    unplayableReason: recording.youtubeVideo.unplayableReason,
  };
}
