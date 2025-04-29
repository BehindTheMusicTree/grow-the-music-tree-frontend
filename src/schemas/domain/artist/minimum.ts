import { z } from "zod";

export const ArtistMinimumSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
});

export type ArtistMinimum = z.infer<typeof ArtistMinimumSchema>;
