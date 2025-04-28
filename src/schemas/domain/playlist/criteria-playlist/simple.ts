import { z } from "zod";
import { CriteriaPlaylistDetailedSchema } from "./detailed";

export const CriteriaPlaylistSimpleSchema = CriteriaPlaylistDetailedSchema.pick({
  uuid: true,
  name: true,
  criteria: true,
  parent: true,
  root: true,
  uploadedTracksCount: true,
  createdOn: true,
  updatedOn: true,
});

export type CriteriaPlaylistSimple = z.infer<typeof CriteriaPlaylistSimpleSchema>;
