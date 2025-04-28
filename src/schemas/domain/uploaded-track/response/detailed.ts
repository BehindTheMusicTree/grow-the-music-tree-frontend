import { z } from "zod";
import { ArtistMinimumSchema } from "@domain/artist";
import { AlbumMinimumSchema } from "@domain/album/shared";
import { CrteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";
import { FileDetailedSchema } from "@domain/file";
import { CriteriaPlaylistMinimumSchema } from "@domain/playlist/criteria-playlist/minimum";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const UploadedTrackDetailedSchema = UuidResourceSchema.extend({
  relativeUrl: z.string(),
  title: z.string(),
  file: FileDetailedSchema,
  artists: z.array(ArtistMinimumSchema),
  album: AlbumMinimumSchema,
  trackNumber: z.number().optional(),
  genre: CrteriaMinimumSchema,
  rating: z.number().min(0).max(10).optional(),
  language: z.string().optional(),
  playlists: z.array(CriteriaPlaylistMinimumSchema),
  playCount: z.number().min(0),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().optional(),
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;
