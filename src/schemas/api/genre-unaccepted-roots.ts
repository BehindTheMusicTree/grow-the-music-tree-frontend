import { z } from "zod";

// Not built on app-kit's CriteriaMinimumSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
export const UnacceptedRootsSchema = z.array(
  z.object({ uuid: z.string().uuid(), name: z.string(), wikidataId: z.string().nullable() }),
);

export type UnacceptedRoot = z.infer<typeof UnacceptedRootsSchema>[number];
