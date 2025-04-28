import { z } from "zod";
import { UuidResourceSchema } from "@domain/uuid-resource";

export const GenrePlaylistDetailedSchema = UuidResourceSchema.extend({
  uuid: z.string(),
  name: z.string(),
  genre: z.object({
    uuid: z.string(),
    name: z.string(),
  }),
  parent: z
    .object({
      uuid: z.string(),
      name: z.string(),
    })
    .nullable(),
  root: z.boolean(),
  uploadedTracksNotArchivedCount: z.number(),
  createdOn: z.string(),
  updatedOn: z.string(),
});

export type GenrePlaylistDetailed = z.infer<typeof GenrePlaylistDetailedSchema>;
