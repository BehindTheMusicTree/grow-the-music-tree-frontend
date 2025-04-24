import { z } from "zod";
import { UuidResourceSchema } from "../base-resource/uuid";

export const PlaylistSchema = UuidResourceSchema.extend({
  name: z.string(),
  description: z.string().nullable(),
  user_id: z.string().uuid(),
  is_public: z.boolean(),
  image_url: z.string().url().nullable(),
});

export type Playlist = z.infer<typeof PlaylistSchema>; 