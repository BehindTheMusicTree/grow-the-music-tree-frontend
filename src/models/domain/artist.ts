import { z } from "zod";

export const ArtistDetailedSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  imageUrl: z.string().url().optional(),
  spotifyUri: z.string(),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type ArtistDetailed = z.infer<typeof ArtistDetailedSchema>;

export const ArtistMinimumSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
});

export type ArtistMinimum = z.infer<typeof ArtistMinimumSchema>;
