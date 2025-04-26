import { z } from "zod";
import { ArtistMinimumSchema } from "../artist";

export const AlbumMinimumSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  album_artists: z.array(ArtistMinimumSchema),
});

export type AlbumMinimum = z.infer<typeof AlbumMinimumSchema>;
