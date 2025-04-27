import { z } from "zod";

export const GenreCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentUuid: z.string().optional(),
});

export type GenreCreationValues = z.infer<typeof GenreCreationSchema>;
