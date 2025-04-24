import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/uuid-resource";

export const GenrePlaylistDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  children: z.array(z.string().uuid()),
  uploadedTracks: z.array(z.unknown()), // Adjust type based on track structure
  uploadedTracksCount: z.number(),
  uploadedTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
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
