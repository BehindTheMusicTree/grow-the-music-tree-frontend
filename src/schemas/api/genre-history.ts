import { z } from "zod";

export const GenreHistoryEntrySchema = z.object({
  uuid: z.string().uuid(),
  action: z.enum([
    "created",
    "parent_changed",
    "renamed",
    "side_changed",
    "excluded",
    "genre_changed",
    "updated",
    "deleted",
    "name_conflict_resolved",
    "root_accepted",
  ]),
  actorPseudo: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  createdOn: z.string(),
});

export const GenreHistorySchema = z.array(GenreHistoryEntrySchema);

export type GenreHistoryEntry = z.infer<typeof GenreHistoryEntrySchema>;
