import { ArtistMinimum } from "@behindthemusictree/app-kit/genre-tree";

export function getArtistsDisplay(artists: ArtistMinimum[] | null | undefined) {
  return artists?.map((artist) => artist.name).join(", ") ?? "";
}
