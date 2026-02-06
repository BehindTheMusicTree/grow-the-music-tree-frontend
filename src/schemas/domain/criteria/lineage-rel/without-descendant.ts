import { z } from "zod";
import { CriteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";

export const CriteriaLineageRelWithoutDescendantSchema = z.object({
  ascendant: CriteriaMinimumSchema,
  degree: z.number(),
});

export type CriteriaLineageRelWithoutDescendant = z.infer<typeof CriteriaLineageRelWithoutDescendantSchema>;
