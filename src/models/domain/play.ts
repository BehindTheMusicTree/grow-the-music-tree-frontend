import { z } from "zod";
import { UuidResourceSchema } from "./base-resource/uuid";

export const PlaySchema = UuidResourceSchema.extend({
  user_id: z.string().uuid(),
  track_id: z.string().uuid(),
  track_type: z.enum(["uploaded", "spotify"]),
  played_at: z.string().datetime(),
});

export type Play = z.infer<typeof PlaySchema>; 