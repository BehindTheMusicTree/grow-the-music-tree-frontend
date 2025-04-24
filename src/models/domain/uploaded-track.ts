import { z } from "zod";
import { ArtistMinimumSchema } from "./artist";
export const UploadedTrackDetailedSchema = z.object({
  uuid: z.string().uuid(),
  relativeUrl: z.string(),
  title: z.string(),
  file: z.string(),
  artists: z.array(ArtistMinimumSchema),
  album: z.string(),
  trackNumber: z.number().optional(),
  genre: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  language: z.string().optional(),
  playlistsPublic: z.array(z.string()).optional(),
  playCount: z.number().default(0),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;
