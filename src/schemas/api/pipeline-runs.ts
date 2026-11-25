import { z } from "zod";

export const PIPELINE_RUN_KINDS = ["curation", "full", "sync"] as const;
export type PipelineRunKind = (typeof PIPELINE_RUN_KINDS)[number];

/** Stages Grow accepts, including failures in the parallel Wikidata chain. */
const STAGES = [
  "fetching_rules",
  "ingesting_discogs",
  "ingesting_musicbrainz",
  "ingesting_geohistory",
  "ingesting_wikidata",
  "building_songs",
  "building_genres",
  "matching_songs",
  "building_gold",
  "importing_tree",
  "importing_graph",
  "uploading_songs",
  "merging_songs",
  "uploading_artists",
  "merging_artists",
  "uploading_region_map",
  "merging_region_map",
] as const;
export type PipelineRunStage = (typeof STAGES)[number];

const WIKIDATA_STAGES = [
  "ingesting_geohistory",
  "ingesting_wikidata",
  "building_wikidata_silver",
  "building_geohistory_silver",
  "resolving_wikidata_silver",
  "anchoring_wikidata_silver",
] as const;
export type WikidataStage = (typeof WIKIDATA_STAGES)[number];

const StepTimingSchema = z.object({
  startedAt: z.iso.datetime({ offset: true }),
  finishedAt: z.iso.datetime({ offset: true }).nullable(),
  state: z.enum(["running", "succeeded", "failed", "cancelled"]),
});

const StepTelemetrySchema = z.object({
  variant: z.enum(["bronze_only", "legacy_silver", "split_silver"]),
  foreground: z.array(StepTimingSchema.extend({ stage: z.enum(STAGES) })),
  wikidata: z.array(StepTimingSchema.extend({ stage: z.enum(WIKIDATA_STAGES) })),
  wikidataRetry: z
    .object({
      attempt: z.number().int().positive(),
      reason: z.enum(["http", "transport", "timeout"]),
      httpStatus: z.number().int().nullish(),
    })
    .nullable(),
});

export type StepTiming = z.infer<typeof StepTimingSchema>;

const IMPORT_STAGES = [
  "importing_tree",
  "importing_graph",
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
  stepTelemetry: StepTelemetrySchema.nullish(),
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
