import { z } from "zod";
import { UuidResourceSchema } from "@schemas/domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@schemas/domain/uploaded-track-playlist-rel";
import { GenreMinimumSchema } from "@schemas/domain/genre/response/minimum";

const baseSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export const GenrePlaylistMinimumSchema = baseSchema;
export type GenrePlaylistMinimum = z.infer<typeof GenrePlaylistMinimumSchema>;

export const GenrePlaylistDetailedSchema = baseSchema.extend({
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  uploadedTracksNotArchivedCount: z.number().min(0),
  durationInSec: z.number().min(0),
  durationStrInHourMinSec: z.string(),
  uploadedTracksArchivedCount: z.number().min(0),
  genre: GenreMinimumSchema,
  root: GenrePlaylistMinimumSchema,
  parent: GenrePlaylistMinimumSchema,
  createdOn: z.string().datetime(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenrePlaylistDetailed = z.infer<typeof GenrePlaylistDetailedSchema>;

export const GenrePlaylistSimpleSchema = GenrePlaylistDetailedSchema.pick({
  uuid: true,
  name: true,
  genre: true,
  parent: true,
  root: true,
  uploadedTracksNotArchivedCount: true,
  createdOn: true,
  updatedOn: true,
});

export type GenrePlaylistSimple = z.infer<typeof GenrePlaylistSimpleSchema>;
