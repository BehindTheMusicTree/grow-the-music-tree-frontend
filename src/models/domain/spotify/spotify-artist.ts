import { z } from "zod";
import { UuidResourceSchema } from "../base-resource/uuid";

export const SpotifyArtistSchema = UuidResourceSchema.extend({
  spotify_id: z.string(),
  name: z.string(),
  genres: z.array(z.string()),
  popularity: z.number().min(0).max(100),
  image_url: z.string().url().nullable(),
  followers_count: z.number().min(0),
});

export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>; 