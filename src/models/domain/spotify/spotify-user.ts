import { z } from "zod";
import { UuidResourceSchema } from "../base-resource/uuid";

export const SpotifyUserSchema = UuidResourceSchema.extend({
  spotify_id: z.string(),
  display_name: z.string(),
  email: z.string().email(),
  country: z.string(),
  product: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  token_expires_at: z.string().datetime(),
  profile_image_url: z.string().url().nullable(),
});

export type SpotifyUser = z.infer<typeof SpotifyUserSchema>; 