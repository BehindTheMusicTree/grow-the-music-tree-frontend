import { YoutubePlayerTrack } from "@behindthemusictree/app-kit/player";
import { SongDetailed } from "@behindthemusictree/app-kit/genre-tree";

// grow only plays reference-tree songs, which have no self-hosted audio and play via
// YouTube embed instead. A song without a video must never reach the player: its
// next/previous skip only honours unplayableReason, so an empty video id would be "played".
export function toPlayerTrack(song: SongDetailed): YoutubePlayerTrack {
  if (!song.youtubeVideo) {
    throw new Error(`Song ${song.uuid} has no YouTube video`);
  }
  return {
    id: song.uuid,
    kind: "youtube",
    youtubeVideoId: song.youtubeVideo.id,
    title: song.title,
    artists: song.artists?.map((artist) => ({ uuid: artist.uuid, name: artist.name })),
    unplayableReason: song.youtubeVideo.unplayableReason,
  };
}
