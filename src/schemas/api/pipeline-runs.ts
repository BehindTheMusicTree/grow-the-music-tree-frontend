import { z } from "zod";

export const PIPELINE_RUN_KINDS = ["curation", "full", "sync"] as const;
export type PipelineRunKind = (typeof PIPELINE_RUN_KINDS)[number];

const FULL_STAGES = [
  "fetching_rules",
  "ingesting_musicbrainz",
  "ingesting_wikidata",
  "building_songs",
  "building_genres",
  "matching_songs",
  "importing_tree",
  "uploading_songs",
  "merging_songs",
  "uploading_artists",
  "merging_artists",
] as const;
export type PipelineRunStage = (typeof FULL_STAGES)[number];

export const PIPELINE_RUN_STAGES: Record<PipelineRunKind, readonly PipelineRunStage[]> = {
  full: FULL_STAGES,
  sync: ["importing_tree", "uploading_songs", "merging_songs", "uploading_artists", "merging_artists"],
  curation: ["fetching_rules", "building_genres", "matching_songs", "importing_tree", "uploading_songs", "merging_songs"],
};

export const PipelineRunRequestSchema = z.object({
  uuid: z.string().uuid(),
  kind: z.enum(PIPELINE_RUN_KINDS),
  trigger: z.enum(["manual", "scheduled"]),
  /** Requesting admin's email; null for a scheduled run, or a manual run older than this field. */
  requestedBy: z.string().nullable(),
  /** `superseded` (curation only): the nightly run applied every edit first. `expired`: no heartbeat for 30 min. */
  status: z.enum(["queued", "running", "succeeded", "failed", "superseded", "cancelled", "expired"]),
  stage: z.enum(FULL_STAGES).nullable(),
  stageCurrent: z.number().nullable(),
  stageTotal: z.number().nullable(),
  error: z.string().nullable(),
  cancelRequested: z.boolean(),
  requestedOn: z.string(),
  startedOn: z.string().nullable(),
  heartbeatOn: z.string().nullable(),
  finishedOn: z.string().nullable(),
});

export type PipelineRunRequest = z.infer<typeof PipelineRunRequestSchema>;

// Not app-kit's PaginatedResponseSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
export const PipelineRunsPageSchema = z.object({
  overallTotal: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(PipelineRunRequestSchema),
});

export type PipelineRunsPage = z.infer<typeof PipelineRunsPageSchema>;
