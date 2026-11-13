import { z } from "zod";

export const PIPELINE_RUN_KINDS = ["curation", "full", "sync"] as const;
export type PipelineRunKind = (typeof PIPELINE_RUN_KINDS)[number];

/** Every stage grow accepts, in run order. `ingesting_wikidata` is accepted but never shown: the wikidata chain runs in parallel. */
const STAGES = [
  "fetching_rules",
  "ingesting_discogs",
  "ingesting_musicbrainz",
  "ingesting_wikidata",
  "building_songs",
  "building_genres",
  "matching_songs",
  "building_gold",
  "importing_tree",
  "uploading_songs",
  "merging_songs",
  "uploading_artists",
  "merging_artists",
  "uploading_region_map",
  "merging_region_map",
] as const;
export type PipelineRunStage = (typeof STAGES)[number];

const IMPORT_STAGES = [
  "importing_tree",
  "uploading_songs",
  "merging_songs",
  "uploading_artists",
  "merging_artists",
  "uploading_region_map",
  "merging_region_map",
] as const satisfies readonly PipelineRunStage[];

export const PIPELINE_RUN_STAGES: Record<PipelineRunKind, readonly PipelineRunStage[]> = {
  full: [
    "fetching_rules",
    "ingesting_discogs",
    "ingesting_musicbrainz",
    "building_songs",
    "building_genres",
    "building_gold",
    ...IMPORT_STAGES,
  ],
  sync: IMPORT_STAGES,
  curation: ["fetching_rules", "building_genres", "matching_songs", "building_gold", ...IMPORT_STAGES],
};

/** Index of the step a stage falls on: a stage the kind doesn't list (e.g. `ingesting_wikidata`) maps to the nearest earlier one. */
export function stageIndexOf(kind: PipelineRunKind, stage: PipelineRunStage): number {
  const steps = PIPELINE_RUN_STAGES[kind];
  for (let i = STAGES.indexOf(stage); i >= 0; i--) {
    const index = steps.indexOf(STAGES[i]);
    if (index >= 0) return index;
  }
  return -1;
}

export const PipelineRunRequestSchema = z.object({
  uuid: z.string().uuid(),
  kind: z.enum(PIPELINE_RUN_KINDS),
  trigger: z.enum(["manual", "scheduled"]),
  /** Requesting admin's email; null for a scheduled run, or a manual run older than this field. */
  requestedBy: z.string().nullable(),
  /** `superseded` (curation only): the nightly run applied every edit first. `expired`: no heartbeat for 30 min. */
  status: z.enum(["queued", "running", "succeeded", "failed", "superseded", "cancelled", "expired"]),
  stage: z.enum(STAGES).nullable(),
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
