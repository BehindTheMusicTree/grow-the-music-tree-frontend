import { formatDuration } from "@components/features/import-runs/importedOn";
import {
  PIPELINE_RUN_STAGES,
  stageIndexOf,
  type PipelineRunKind,
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
  ingesting_wikidata: "Ingestion Wikidata",
  building_songs: "Construction des morceaux",
  building_genres: "Ingestion Wikidata et construction des genres",
  matching_songs: "Rattachement des morceaux",
  building_gold: "Construction du Gold",
  importing_tree: "Import de l'arbre",
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

function timingDetail(step: StepTiming, now: number | null): string | undefined {
  if (step.finishedAt) return formatDuration(step.startedAt, step.finishedAt);
  if (step.state === "running" && now !== null) return `depuis ${formatDuration(step.startedAt, now)}`;
}

export function foregroundStepDetails(steps: RunStep[], request: PipelineRunRequest, now: number | null): RunStep[] {
  const telemetry = request.stepTelemetry;
  if (!telemetry) return steps;
  const running = request.status === "running";
  const bronzeOnly = telemetry.variant === "bronze_only";
  const hasRunningStep = telemetry.foreground.at(-1)?.state === "running";
  return steps.flatMap((step) => {
    const timing = telemetry.foreground.find(({ stage }) => stage === step.key);
    if (!timing) {
      if (bronzeOnly && !BRONZE_FOREGROUND_STAGES.includes(step.key)) return [];
      if (!running) return step;
      return hasRunningStep ? { ...step, status: "pending", detail: undefined } : { ...step, status: step.status === "current" ? "current" : "pending" };
    }
    const status = stepStatusOf(timing, request);
    const detail = [step.detail, timingDetail(timing, status === "current" ? now : null)].filter(Boolean).join(" · ");
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

export function wikidataStepsOf(request: PipelineRunRequest, now: number | null) {
  return (request.stepTelemetry?.wikidata ?? []).map((step) => ({
    key: step.stage,
    label: WIKIDATA_LABELS[step.stage],
    status: stepStatusOf(step, request),
    detail: timingDetail(step, now),
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
  const stageIndex = stage ? stageIndexOf(kind, stage) : -1;
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
