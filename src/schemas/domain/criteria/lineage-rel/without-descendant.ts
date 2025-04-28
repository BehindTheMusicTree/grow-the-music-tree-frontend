import { z } from "zod";
import { CrteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";

export const CriteriaLineageRelWithoutDescendantsSchema = z.object({
  ascendants: z.array(CrteriaMinimumSchema),
  degree: z.number(),
});
