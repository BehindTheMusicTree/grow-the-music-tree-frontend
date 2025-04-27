import { z } from "zod";
import { ArtistMinimumSchema } from "../../artist";
import { AlbumMinimumSchema } from "../../album/shared";
import { GenreMinimumSchema } from "../genre/minimum";
import { FileDetailedSchema } from "../../file";
import { PlaylistMinimumSchema } from "../../playlist/shared";
import { UuidResourceSchema } from "../../uuid-resource";

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
