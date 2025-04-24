import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const AlbumSchema = UuidResourceSchema.extend({
  name: z.string(),
  release_date: z.string().datetime(),
  image_url: z.string().url().nullable(),
  spotify_id: z.string().nullable(),
  artist_id: z.string().uuid(),
});

export type Album = z.infer<typeof AlbumSchema>; 