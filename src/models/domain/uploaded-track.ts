import { z } from "zod";
import { ArtistMinimumSchema } from "./artist";
import { AlbumMinimumSchema } from "./album";

export const UploadedTrackDetailedSchema = z.object({
  uuid: z.string().uuid(),
  relativeUrl: z.string(),
  title: z.string(),
  file: z.string(),
  artists: z.array(ArtistMinimumSchema),
  album: AlbumMinimumSchema,
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

export const UploadedTrackSimpleWithoutAlbumWithPositionInAlbumSchema = z.object({
  uuid: z.string().uuid(),
  title: z.string(),
  trackNumber: z.number().optional(),
  artists: z.array(ArtistMinimumSchema),
  genre: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  language: z.string().optional(),
  playCount: z.number().default(0),
});

export type UploadedTrackSimpleWithoutAlbumWithPositionInAlbum = z.infer<
  typeof UploadedTrackSimpleWithoutAlbumWithPositionInAlbumSchema
>;
