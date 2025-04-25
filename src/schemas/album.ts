import { z } from "zod";
import { ArtistMinimumSchema } from "@schemas/artist";
import { UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema } from "@schemas/uploaded-track";

export const AlbumDetailedSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  year: z.number().optional(),
  album_artists: z.array(ArtistMinimumSchema),
  library_tracks_sorted: z.array(UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema),
  library_tracks_count: z.number(),
  library_tracks_archived_count: z.number(),
  duration_in_sec: z.number(),
  duration_str_in_hour_min_sec: z.string(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().optional(),
});

export type AlbumDetailed = z.infer<typeof AlbumDetailedSchema>;

export const AlbumMinimumSchema = AlbumDetailedSchema.pick({
  uuid: true,
  name: true,
  album_artists: true,
});

export type AlbumMinimum = z.infer<typeof AlbumMinimumSchema>;
