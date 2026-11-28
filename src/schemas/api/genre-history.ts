import { z } from "zod";

export const GenreHistoryEntrySchema = z.object({
  uuid: z.string().uuid(),
  action: z.string().min(1),
  actorPseudo: z.string().nullable(),
  oldValue: z.string().nullable(),
  newValue: z.string().nullable(),
  createdOn: z.string(),
});

export const GenreHistorySchema = z.array(GenreHistoryEntrySchema);

export type GenreHistoryEntry = z.infer<typeof GenreHistoryEntrySchema>;
