import { z } from "zod";
import { PaginatedResponseSchema } from "./pagination";

// Common genre fields
const BaseGenreSchema = z.object({
  uuid: z.string().uuid(),
  name: z.string(),
  parent: z.string().uuid().nullable(),
  createdOn: z.string().datetime(),
});

// Full genre response (for retrieve/update/post)
export const GenreResponseSchema = BaseGenreSchema.extend({
  ascendants: z.array(z.string().uuid()),
  descendants: z.array(z.string().uuid()),
  root: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  children: z.array(z.string().uuid()),
  criteriaPlaylist: z.object({
    uuid: z.string().uuid(),
    name: z.string(),
  }),
  libraryTracks: z.array(z.unknown()), // Adjust type based on track structure
  libraryTracksCount: z.number(),
  libraryTracksArchivedCount: z.number(),
  updatedOn: z.string().datetime().nullable(),
});

// List response using pagination schema
export const GenreListResponseSchema = PaginatedResponseSchema(BaseGenreSchema);

// Types
export type GenreResponse = z.infer<typeof GenreResponseSchema>;
export type GenreListResponse = z.infer<typeof GenreListResponseSchema>;
export type BaseGenre = z.infer<typeof BaseGenreSchema>;
