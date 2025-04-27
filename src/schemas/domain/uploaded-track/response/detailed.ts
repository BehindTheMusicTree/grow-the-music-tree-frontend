import { z } from "zod";
import { ArtistMinimumSchema } from "@schemas/domain/artist";
import { AlbumMinimumSchema } from "@schemas/domain/album/shared";
import { GenreMinimumSchema } from "@schemas/domain/genre/response/minimum";
import { FileDetailedSchema } from "@schemas/domain/file";
import { PlaylistMinimumSchema } from "@schemas/domain/playlist/shared";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";

export const UploadedTrackDetailedSchema = UuidResourceSchema.extend({
  relativeUrl: z.string(),
  title: z.string(),
  file: FileDetailedSchema,
  artists: z.array(ArtistMinimumSchema),
  album: AlbumMinimumSchema,
  trackNumber: z.number().optional(),
  genre: GenreMinimumSchema,
  rating: z.number().min(0).max(10).optional(),
  language: z.string().optional(),
  playlists: z.array(PlaylistMinimumSchema),
  playCount: z.number().min(0),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().optional(),
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;
