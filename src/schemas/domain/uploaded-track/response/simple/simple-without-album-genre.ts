import { z } from "zod";
import { UploadedTrackSimpleSchema } from "./simple";

export const UploadedTrackSimpleWithoutAlbumGenreSerializer = UploadedTrackSimpleSchema.omit({
  album: true,
  genre: true,
});

export type UploadedTrackSimpleWithoutAlbumPlaylistGenre = z.infer<
  typeof UploadedTrackSimpleWithoutAlbumGenreSerializer
>;
