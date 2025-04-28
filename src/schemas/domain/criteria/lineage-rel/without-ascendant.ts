import { z } from "zod";
import { CrteriaMinimumSchema } from "@schemas/domain/criteria/response/minimum";

export const CriteriaLineageRelWithoutAscendantSchema = z.object({
  descendants: z.array(CrteriaMinimumSchema),
  degree: z.number(),
});
