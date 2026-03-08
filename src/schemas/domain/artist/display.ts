import { ArtistMinimum } from "./minimum";

export function getArtistsDisplay(artists: ArtistMinimum[] | null | undefined) {
  return artists?.map((artist) => artist.name).join(", ") ?? "";
}
