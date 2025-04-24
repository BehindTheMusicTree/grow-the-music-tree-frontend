import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const UploadedTrackSchema = UuidResourceSchema.extend({
  title: z.string(),
  duration: z.number().min(0),
  file_url: z.string().url(),
  artist_id: z.string().uuid(),
  album_id: z.string().uuid().nullable(),
  genre_ids: z.array(z.string().uuid()),
  tag_ids: z.array(z.string().uuid()),
});

export type UploadedTrack = z.infer<typeof UploadedTrackSchema>; 