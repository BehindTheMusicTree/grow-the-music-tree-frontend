import { z } from "zod";

export const SpotifyLibTrackDetailedSchema = z.object({
  uuid: z.string().uuid(),
  spotifyId: z.string(),
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  duration: z.number(),
  imageUrl: z.string().url().optional(),
  spotifyUri: z.string(),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
});

export type SpotifyLibTrackDetailed = z.infer<typeof SpotifyLibTrackDetailedSchema>;
