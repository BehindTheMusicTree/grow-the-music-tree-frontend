import { formatDuration } from "@components/features/import-runs/importedOn";
import {
  PIPELINE_RUN_STAGES,
  stageIndexOf,
  type PipelineRunKind,
  type PipelineRunLatest,
  type PipelineRunRequest,
  type PipelineRunStage,
  type StepTiming,
  type WikidataStage,
} from "@schemas/api/pipeline-runs";

export const KIND_LABELS: Record<PipelineRunKind, string> = {
  curation: "Curation",
  full: "Ingestion complète",
  sync: "Réimport du dernier Gold",
};

export const STAGE_LABELS: Record<PipelineRunStage, string> = {
  fetching_rules: "Récupération des règles",
  ingesting_discogs: "Ingestion Discogs",
  ingesting_musicbrainz: "Ingestion MusicBrainz",
  ingesting_geohistory: "Ingestion Geohistory",
  ingesting_wikidata: "Ingestion Wikidata",
  building_songs: "Construction des morceaux",
  building_genres: "Ingestion Wikidata et construction des genres",
  matching_songs: "Rattachement des morceaux",
  building_gold: "Construction du Gold",
  importing_tree: "Import des arbres de genres",
  importing_graph: "Import du graphe des genres",
  uploading_songs: "Envoi des morceaux",
  merging_songs: "Fusion des morceaux",
  uploading_artists: "Envoi des artistes",
  merging_artists: "Fusion des artistes",
  uploading_region_map: "Envoi de la carte des régions",
  merging_region_map: "Fusion de la carte des régions",
};

export const UPLOAD_STAGES: readonly PipelineRunStage[] = [
  "uploading_songs",
  "uploading_artists",
  "uploading_region_map",
];

export function originOf({ trigger, requestedBy }: Pick<PipelineRunRequest, "trigger" | "requestedBy">) {
  if (trigger === "scheduled") return "Nightly";
  return requestedBy ? `Manuel · ${requestedBy}` : "Manuel";
}

export type RunStepStatus = "pending" | "current" | "done" | "failed";
export type RunStep = { key: PipelineRunStage; label: string; status: RunStepStatus; detail?: string };

const WIKIDATA_LABELS: Record<WikidataStage, string> = {
  ingesting_geohistory: "Ingestion Geohistory",
  ingesting_wikidata: "Ingestion Wikidata",
  building_wikidata_silver: "Construction du Silver Wikidata",
  building_geohistory_silver: "Construction du Silver Geohistory",
  resolving_wikidata_silver: "Résolution Wikidata",
  anchoring_wikidata_silver: "Ancrage Wikidata",
};

export const WIKIDATA_JOIN_LABEL = "Attente de la chaîne Wikidata";

const BRONZE_FOREGROUND_STAGES: readonly PipelineRunStage[] = [
  "fetching_rules",
  "ingesting_discogs",
  "ingesting_musicbrainz",
  "building_genres",
];

const EPOCH = "1970-01-01T00:00:00Z";
const SLOW_MARGIN_SECONDS = 600;

/** Same threshold as the pipeline poller: past it the stage is slower than usual. */
export const isSlowStage = (elapsedSeconds: number, medianSeconds: number) =>
  elapsedSeconds > Math.max(2 * medianSeconds, medianSeconds + SLOW_MARGIN_SECONDS);

function timingDetail(step: StepTiming, now: number | null, medianSeconds?: number): string | undefined {
  if (step.finishedAt) return formatDuration(step.startedAt, step.finishedAt);
  if (step.state !== "running" || now === null) return;
  const elapsed = `depuis ${formatDuration(step.startedAt, now)}`;
  if (medianSeconds === undefined) return elapsed;
  const usual = `habituellement ~${formatDuration(EPOCH, medianSeconds * 1000)}`;
  return isSlowStage((now - Date.parse(step.startedAt)) / 1000, medianSeconds)
    ? `${elapsed} · ${usual} · plus long que d'habitude`
    : `${elapsed} · ${usual}`;
}

export function foregroundStepDetails(steps: RunStep[], request: PipelineRunLatest, now: number | null): RunStep[] {
  const telemetry = request.stepTelemetry;
  if (!telemetry) return steps;
  const running = request.status === "running";
  const bronzeOnly = telemetry.variant === "bronze_only";
  const bootstrapping = request.activeImport?.bootstrap === true;
  const hasRunningStep = telemetry.foreground.at(-1)?.state === "running";
  // A step with no timing before the last recorded one never ran (e.g. `building_genres` when the Wikidata chain
  // finished before the join); hiding it beats showing it as "à venir" forever.
  const lastRecorded = steps.findLastIndex((step) => telemetry.foreground.some(({ stage }) => stage === step.key));
  return steps.flatMap((step, index) => {
    const timing = telemetry.foreground.find(({ stage }) => stage === step.key);
    if (!timing) {
      if (index < lastRecorded) return [];
      if (bronzeOnly && !BRONZE_FOREGROUND_STAGES.includes(step.key)) return [];
      if (!running) return step;
      return hasRunningStep ? { ...step, status: "pending", detail: undefined } : { ...step, status: step.status === "current" ? "current" : "pending" };
    }
    const status = stepStatusOf(timing, request);
    // A first graph import can take hours: the median would flag it as slow for nothing.
    const median = bootstrapping && step.key === "importing_graph" ? undefined : request.typicalStageSeconds?.foreground[step.key];
    const detail = [step.detail, timingDetail(timing, status === "current" ? now : null, median)].filter(Boolean).join(" · ");
    return {
      ...step,
      status,
      label: step.key === "building_genres" ? WIKIDATA_JOIN_LABEL : step.label,
      ...(detail && { detail }),
    };
  });
}

function stepStatusOf(step: StepTiming, request: PipelineRunRequest): RunStepStatus {
  if (step.state === "succeeded") return "done";
  return step.state === "running" && request.status === "running" ? "current" : "failed";
}

export function wikidataStepsOf(request: PipelineRunLatest, now: number | null) {
  return (request.stepTelemetry?.wikidata ?? []).map((step) => ({
    key: step.stage,
    label: WIKIDATA_LABELS[step.stage],
    status: stepStatusOf(step, request),
    detail: timingDetail(step, now, request.typicalStageSeconds?.wikidata[step.stage]),
  }));
}

export function wikidataRetryLabel(request: PipelineRunRequest): string | null {
  const retry = request.status === "running" ? request.stepTelemetry?.wikidataRetry : null;
  const step = request.stepTelemetry?.wikidata.at(-1);
  if (!retry || step?.stage !== "ingesting_wikidata" || step.state !== "running") return null;
  const reason = retry.reason === "http" ? retry.httpStatus ? `HTTP ${retry.httpStatus}` : "erreur HTTP" : retry.reason === "timeout" ? "délai dépassé" : "erreur réseau";
  return `WDQS (${reason}) · nouvelle tentative après l’échec de la tentative ${retry.attempt}`;
}

/** Every stage of the run with its state; null when the run has no stage list (superseded). */
export function stepsOf({
  kind,
  status,
  stage,
  stageCurrent,
  stageTotal,
}: Pick<PipelineRunRequest, "kind" | "status" | "stage" | "stageCurrent" | "stageTotal">): RunStep[] | null {
  if (status === "superseded") return null;
  const stages = PIPELINE_RUN_STAGES[kind];
  const stageIndex = stage && stage !== "ingesting_geohistory" ? stageIndexOf(kind, stage) : -1;
  const stopped = status === "failed" || status === "cancelled" || status === "expired";
  return stages.map((key, index) => {
    let stepStatus: RunStepStatus = "pending";
    if (status === "succeeded") stepStatus = "done";
    else if ((status === "running" || stopped) && stageIndex >= 0) {
      if (index < stageIndex) stepStatus = "done";
      else if (index === stageIndex) stepStatus = stopped ? "failed" : "current";
    }
    const detail =
      stepStatus === "current" && UPLOAD_STAGES.includes(key) && stageCurrent !== null && stageTotal !== null
        ? `${stageCurrent}/${stageTotal}`
        : undefined;
    return { key, label: STAGE_LABELS[key], status: stepStatus, ...(detail && { detail }) };
  });
}
