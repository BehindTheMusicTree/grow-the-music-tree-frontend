import { z } from "zod";

import { ArtistMinimumSchema } from "@domain/artist/minimum";
import { AlbumMinimumSchema } from "@schemas/domain/album/minimum";
import { CriteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";
import { FileDetailedSchema } from "@schemas/domain/uploaded-track/file";
import { CriteriaPlaylistMinimumSchema } from "@domain/playlist/criteria-playlist/minimum";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const UploadedTrackDetailedSchema = UuidResourceSchema.extend({
  relativeUrl: z.string(),
  title: z.string(),
  file: FileDetailedSchema,
  artists: z.array(ArtistMinimumSchema).nullable().optional(),
  album: AlbumMinimumSchema.nullable().optional(),
  trackNumber: z.number().nullable().optional(),
  genre: CriteriaMinimumSchema,
  rating: z.number().min(0).max(10).nullable().optional(),
  language: z.string().nullable().optional(),
  playlists: z.array(CriteriaPlaylistMinimumSchema),
  playCount: z.number().min(0),
  archived: z.boolean(),
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable().optional(),
});

export type UploadedTrackDetailed = z.infer<typeof UploadedTrackDetailedSchema>;
