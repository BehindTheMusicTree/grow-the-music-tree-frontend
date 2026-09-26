import { z } from "zod";

// Not built on app-kit's CriteriaMinimumSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
const GenreRefSchema = z.object({ uuid: z.string().uuid(), name: z.string() });

export const GenreNameConflictGroupsSchema = z.array(
  z.object({
    name: z.string(),
    genres: z.array(
      GenreRefSchema.extend({
        wikidataId: z.string().nullable(),
        parent: GenreRefSchema.nullable(),
        hasNameConflict: z.boolean(),
      }),
    ),
  }),
);

export type GenreNameConflictGroup = z.infer<typeof GenreNameConflictGroupsSchema>[number];
export type ConflictingGenre = GenreNameConflictGroup["genres"][number];
