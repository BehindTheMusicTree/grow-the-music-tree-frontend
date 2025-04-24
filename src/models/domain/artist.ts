import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const ArtistSchema = UuidResourceSchema.extend({
  name: z.string(),
  spotify_id: z.string().nullable(),
  image_url: z.string().url().nullable(),
});

export type Artist = z.infer<typeof ArtistSchema>; 