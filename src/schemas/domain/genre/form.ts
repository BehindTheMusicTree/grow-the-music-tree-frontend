import { z } from "zod";

export const GenreCreationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentUuid: z.string().optional(),
});

export const GenreUpdateSchema = z.object({
  name: z.string().optional(),
  parentUuid: z.string().optional(),
});

export type GenreCreationValues = z.infer<typeof GenreCreationSchema>;
export type GenreUpdateValues = z.infer<typeof GenreUpdateSchema>;
