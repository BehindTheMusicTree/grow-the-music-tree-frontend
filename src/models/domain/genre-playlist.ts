import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@/models/domain/uploaded-track-playlist-rel";
import { GenreMinimumSchema } from "@/models/domain/genre";

const baseSchema = UuidResourceSchema.extend({
  name: z.string(),
});

export const GenrePlaylistMinimumSchema = baseSchema;
export type GenrePlaylistMinimum = z.infer<typeof GenrePlaylistMinimumSchema>;

export const GenrePlaylistDetailedSchema = baseSchema.extend({
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  uploadedTracksNotArchivedCountPublic: z.number().min(0),
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

export const GenrePlaylistSimpleSchema = GenrePlaylistDetailedSchema.omit({
  uploadedTrackPlaylistRels: true,
  uploadedTracksNotArchivedCountPublic: true,
  durationInSec: true,
  durationStrInHourMinSec: true,
  uploadedTracksArchivedCount: true,
  genre: true,
  root: true,
  parent: true,
});

export type GenrePlaylistSimple = z.infer<typeof GenrePlaylistSimpleSchema>;
