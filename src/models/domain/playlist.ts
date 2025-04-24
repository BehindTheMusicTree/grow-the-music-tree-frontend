import { z } from "zod";

export const PlaylistMinimumSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
});

export type PlaylistMinimum = z.infer<typeof PlaylistMinimumSchema>;
