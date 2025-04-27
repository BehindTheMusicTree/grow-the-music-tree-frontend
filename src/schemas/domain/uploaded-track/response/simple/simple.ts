import { z } from "zod";
import { UploadedTrackDetailedSchema } from "../detailed";

export const UploadedTrackSimpleSchema = UploadedTrackDetailedSchema.pick({
  uuid: true,
  title: true,
  artists: true,
  album: true,
  trackNumber: true,
  genre: true,
  rating: true,
  language: true,
  playCount: true,
});

export type UploadedTrackSimple = z.infer<typeof UploadedTrackSimpleSchema>;
