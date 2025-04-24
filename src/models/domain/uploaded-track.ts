import { z } from "zod";
import { ArtistMinimumSchema } from "./artist";
import { AlbumMinimumSchema } from "./album";
import { GenreMinimumSchema } from "./genre";
import { FileDetailedSchema } from "./file";

export const UploadedTrackDetailedSchema = z.object({
  uuid: z.string().uuid(),
  relativeUrl: z.string(),
  title: z.string(),
  file: FileDetailedSchema,
  artists: z.array(ArtistMinimumSchema),
  album: AlbumMinimumSchema,
  trackNumber: z.number().optional(),
  genre: GenreMinimumSchema,
  rating: z.number().min(0).max(10).optional(),
  language: z.string().optional(),
  playlistsPublic: z.array(z.string()).optional(),
  playCount: z.number().default(0),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime(),
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;

export const UploadedTrackMinimumSchema = UploadedTrackDetailedSchema.pick({
  uuid: true,
  title: true,
  artists: true,
  album: true,
  trackNumber: true,
  genre: true,
  rating: true,
  language: true,
  playCount: true,
});

export type UploadedTrackMinimum = z.infer<typeof UploadedTrackMinimumSchema>;

export const UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema = UploadedTrackMinimumSchema.pick({
  uuid: true,
  title: true,
  artists: true,
  trackNumber: true,
  genre: true,
  rating: true,
  language: true,
  playCount: true,
});

export type UploadedTrackSimpleWithoutAlbumWithTrackNumber = z.infer<
  typeof UploadedTrackSimpleWithoutAlbumWithTrackNumberSchema
>;

export const UploadedTrackWithoutAlbumPlaylistGenreSerializer = UploadedTrackMinimumSchema.pick({
  uuid: true,
  title: true,
  artists: true,
  rating: true,
  language: true,
  playCount: true,
});

export type UploadedTrackWithoutAlbumPlaylistGenre = z.infer<typeof UploadedTrackWithoutAlbumPlaylistGenreSerializer>;
