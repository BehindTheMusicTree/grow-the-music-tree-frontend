import { UploadedTrackMinimum } from "./response/minimum";

export function getArtistsDisplay(uploadedTrack: UploadedTrackMinimum) {
  return uploadedTrack.artists?.map((artist) => artist.name).join(", ");
}
