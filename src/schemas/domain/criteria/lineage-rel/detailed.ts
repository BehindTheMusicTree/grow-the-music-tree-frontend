import { CriteriaLineageRelWithoutDescendantSchema } from "./without-descendant";
import { CriteriaLineageRelWithoutAscendantSchema } from "./without-ascendant";

export const CriteriaLineageRelDetailedSchema = CriteriaLineageRelWithoutDescendantSchema.merge(
  CriteriaLineageRelWithoutAscendantSchema
);
