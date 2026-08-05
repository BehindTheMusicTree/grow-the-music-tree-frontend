import { PlayerTrack } from "@behindthemusictree/app-kit/player";
import { UploadedTrackDetailed } from "@behindthemusictree/app-kit/genre-tree";

export function toPlayerTrack(track: UploadedTrackDetailed): PlayerTrack {
  return {
    id: track.uuid,
    streamUrl: "",
    title: track.title,
    artists: track.artists?.map((artist) => ({ name: artist.name })),
  };
}
