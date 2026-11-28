import { z } from "zod";

export const PIPELINE_RUN_KINDS = ["curation", "full", "sync", "sync_artists"] as const;
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
  sync_artists: ["uploading_artists", "merging_artists"],
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

export const PIPELINE_RUN_LATEST_QUERY_KEY = ["pipelineRuns", "latest"];

export const PipelineRunConflictSchema = z.object({
  details: z.object({ message: z.string().min(1) }),
});

const ArtistsRecoverySchema = z.object({
  eligible: z.boolean(),
  reason: z.string().nullable(),
  songsApplied: z.boolean(),
  artistsApplied: z.boolean(),
  snapshotsFinalized: z.boolean(),
});

export const PipelineRunRequestSchema = z.object({
  uuid: z.string().uuid(),
  sourceRunUuid: z.string().uuid().optional(),
  artistsRecovery: ArtistsRecoverySchema.nullish(),
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

/** `kind` stays a string: Grow owns the list of import kinds and the front only labels it, falling back to the raw value. */
const ImportProgressSchema = z.object({
  runId: z.number(),
  taskId: z.string(),
  kind: z.string(),
  mode: z.string(),
  attempt: z.number(),
  /** Strings, like `kind`: a state Grow adds later must not break parsing of the whole run; the front only tests for the terminal ones. */
  state: z.string(),
  startedAt: z.string().nullable(),
  step: z.string().nullable(),
  stepStartedAt: z.string().nullable(),
  heartbeatAt: z.string().nullable(),
  sql: z.object({
    waitEventType: z.string().nullable().optional(),
    blockerCount: z.number().optional(),
  }),
  observabilityStale: z.boolean(),
  /** First import of the graph (no previous revision); null for other kinds or once the run was cleaned up. */
  bootstrap: z.boolean().nullable(),
});

export type ImportProgress = z.infer<typeof ImportProgressSchema>;

/** Only `pipeline/runs/latest/` carries these two keys; the launch, cancel and history responses do not. */
export const PipelineRunLatestSchema = PipelineRunRequestSchema.extend({
  /** Newest linked import attempt; null while the songs/artists parts upload, since the attempt only exists at commit. */
  activeImport: ImportProgressSchema.nullable(),
  /** Median seconds per stage over recent succeeded runs; null unless the run is a `full` one. */
  typicalStageSeconds: z
    .object({ foreground: z.record(z.string(), z.number()), wikidata: z.record(z.string(), z.number()) })
    .nullable(),
});

export type PipelineRunLatest = z.infer<typeof PipelineRunLatestSchema>;

// Not app-kit's PaginatedResponseSchema: app-kit's barrels create React contexts at import,
// which breaks the server components that fetch this.
export const PipelineRunsPageSchema = z.object({
  overallTotal: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(PipelineRunRequestSchema),
});

export type PipelineRunsPage = z.infer<typeof PipelineRunsPageSchema>;
