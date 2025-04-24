import { z } from "zod";
import { UuidResourceSchema } from "../base-resource/uuid";

export const SpotifyLibTrackSchema = UuidResourceSchema.extend({
  spotify_id: z.string(),
  title: z.string(),
  duration: z.number().min(0),
  preview_url: z.string().url().nullable(),
  artist_id: z.string().uuid(),
  album_id: z.string().uuid().nullable(),
  genre_ids: z.array(z.string().uuid()),
  tag_ids: z.array(z.string().uuid()),
});

export type SpotifyLibTrack = z.infer<typeof SpotifyLibTrackSchema>; 