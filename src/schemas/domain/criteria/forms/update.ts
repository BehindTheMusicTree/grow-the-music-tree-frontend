import { z } from "zod";

export const CriteriaUpdateSchema = z.object({
  name: z.string().optional(),
  parent: z.string().optional(),
});

export type CriteriaUpdateValues = z.infer<typeof CriteriaUpdateSchema>;
