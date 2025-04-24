import { z } from "zod";
import { UuidResourceSchema } from "@/models/domain/uuid-resource";

export const GenrePlaylistDetailedSchema = UuidResourceSchema.extend({
  name: z.string(),
  children: z.array(z.string().uuid()),
  libraryTracks: z.array(z.unknown()), // Adjust type based on track structure
  libraryTracksCount: z.number(),
  libraryTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

export type GenrePlaylistDetailed = z.infer<typeof GenrePlaylistDetailedSchema>;

export const GenrePlaylistSimpleSchema = GenrePlaylistDetailedSchema.omit({
  children: true,
  libraryTracks: true,
  libraryTracksCount: true,
  libraryTracksArchivedCount: true,
  updatedOn: true,
});

export type GenrePlaylistSimple = z.infer<typeof GenrePlaylistSimpleSchema>;
