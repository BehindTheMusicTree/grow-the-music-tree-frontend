import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/uuid-resource";
import { UploadedTrackPlaylistRelWithoutPlaylistSchema } from "@/models/domain/uploaded-track-playlist-rel";
import { GenreMinimumSchema } from "@/models/domain/genre";
export const GenrePlaylistDetailedSchema = UuidResourceSchema.extend({
  uuid: z.string().uuid(),
  name: z.string(),
  uploadedTrackPlaylistRels: z.array(UploadedTrackPlaylistRelWithoutPlaylistSchema),
  uploadedTracksNotArchivedCountPublic: z.number().min(0),
  durationInSec: z.number().min(0),
  durationStrInHourMinSec: z.string(),
  uploadedTracksArchivedCount: z.number().min(0),
  genre: GenreMinimumSchema,
  root: GenrePlaylistMinimumSchema,
  parent: GenrePlaylistMinimumSchema,
});

export type GenrePlaylistDetailed = z.infer<typeof GenrePlaylistDetailedSchema>;

export const GenrePlaylistSimpleSchema = GenrePlaylistDetailedSchema.omit({
  children: true,
  uploadedTracks: true,
  uploadedTracksCount: true,
  uploadedTracksArchivedCount: true,
  updatedOn: true,
});

export type GenrePlaylistSimple = z.infer<typeof GenrePlaylistSimpleSchema>;

export const GenrePlaylistMinimumSchema = GenrePlaylistDetailedSchema.pick({
  uuid: true,
  name: true,
});

export type GenrePlaylistMinimum = z.infer<typeof GenrePlaylistMinimumSchema>;
