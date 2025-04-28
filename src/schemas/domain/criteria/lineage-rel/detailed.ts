import { CriteriaLineageRelWithoutDescendantsSchema } from "./without-descendant";
import { CriteriaLineageRelWithoutAscendantSchema } from "./without-ascendant";

export const CriteriaLineageRelSchema = CriteriaLineageRelWithoutDescendantsSchema.merge(
  CriteriaLineageRelWithoutAscendantSchema
);
