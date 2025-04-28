import { CriteriaLineageRelWithoutDescendantsSchema } from "./without-descendant";
import { CriteriaLineageRelWithoutAscendantsSchema } from "./without-ascendant";

export const CriteriaLineageRelSchema = CriteriaLineageRelWithoutDescendantsSchema.merge(
  CriteriaLineageRelWithoutAscendantsSchema
);
