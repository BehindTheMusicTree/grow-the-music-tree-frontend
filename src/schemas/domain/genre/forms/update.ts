import { z } from "zod";

export const GenreUpdateSchema = z.object({
  name: z.string().optional(),
  parentUuid: z.string().optional(),
});

export type GenreUpdateValues = z.infer<typeof GenreUpdateSchema>;
