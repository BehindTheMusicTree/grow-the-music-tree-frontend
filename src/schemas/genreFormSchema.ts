import { z } from "zod";

export const GenreFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type GenreFormValues = z.infer<typeof GenreFormSchema>;
