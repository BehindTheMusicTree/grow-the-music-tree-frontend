import { z } from "zod";
import { CriteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";

export const CriteriaLineageRelWithoutAscendantSchema = z.object({
  descendant: CriteriaMinimumSchema,
  degree: z.number(),
});

export type CriteriaLineageRelWithoutAscendant = z.infer<typeof CriteriaLineageRelWithoutAscendantSchema>;
