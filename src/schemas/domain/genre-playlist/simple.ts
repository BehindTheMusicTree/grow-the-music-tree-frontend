import { z } from "zod";
import { GenrePlaylistDetailedSchema } from "@domain/genre-playlist/detailed";

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
