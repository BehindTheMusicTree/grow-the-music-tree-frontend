import { z } from "zod";
import { UploadedTrackSimpleSchema } from "./simple";

export const UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema = UploadedTrackSimpleSchema.omit({
  album: true,
});

export type UploadedTrackSimpleWithoutAlbumWithTrackNumber = z.infer<
  typeof UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema
>;
