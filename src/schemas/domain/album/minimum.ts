import { z } from "zod";

import { ArtistMinimumSchema } from "@domain/artist/minimum";

export const AlbumMinimumSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  album_artists: z.array(ArtistMinimumSchema).nullable().optional(),
});

export type AlbumMinimum = z.infer<typeof AlbumMinimumSchema>;
