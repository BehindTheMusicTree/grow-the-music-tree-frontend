import {
  PIPELINE_RUN_STAGES,
  stageIndexOf,
  type PipelineRunKind,
  type PipelineRunRequest,
  type PipelineRunStage,
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
