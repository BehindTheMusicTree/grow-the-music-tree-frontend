import { z } from "zod";
import { CriteriaPlaylistDetailedSchema } from "./detailed";

export const CriteriaPlaylistSimpleSchema = CriteriaPlaylistDetailedSchema.pick({
  uuid: true,
  name: true,
  parent: true,
  createdOn: true,
});

export type CriteriaPlaylistSimple = z.infer<typeof CriteriaPlaylistSimpleSchema>;
