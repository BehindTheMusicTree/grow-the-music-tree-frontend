"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useQueryWithParse, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import { formatDuration } from "@components/features/import-runs/importedOn";
import { KIND_LABELS, originOf } from "@components/features/pipeline-runs/labels";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  PIPELINE_RUN_KINDS,
  PIPELINE_RUN_STAGES,
  PipelineRunRequestSchema,
  type PipelineRunRequest,
  type PipelineRunStage,
} from "@schemas/api/pipeline-runs";

const POLL_INTERVAL_MS = 5000;
const LATEST_QUERY_KEY = ["pipelineRuns", "latest"];

const STAGE_LABELS: Record<PipelineRunStage, string> = {
  fetching_rules: "Récupération des règles",
  ingesting_musicbrainz: "Ingestion MusicBrainz",
  ingesting_wikidata: "Ingestion Wikidata",
  building_songs: "Construction des morceaux",
  building_genres: "Construction des genres",
  matching_songs: "Rattachement des morceaux",
  importing_tree: "Import de l'arbre",
  uploading_songs: "Envoi des morceaux",
  merging_songs: "Fusion des morceaux",
};

const isActive = (request: PipelineRunRequest | null | undefined) =>
  request?.status === "queued" || request?.status === "running";

/** Fraction of the run done, or null when there's no bar to show. */
function progressOf({ kind, status, stage, stageCurrent, stageTotal }: PipelineRunRequest): number | null {
  if (status === "succeeded") return 1;
  if (status === "queued") return 0;
  if (status !== "running") return null;
  const stages = PIPELINE_RUN_STAGES[kind];
  const index = stage ? stages.indexOf(stage) : 0;
  const sub = stage === "uploading_songs" && stageCurrent !== null && stageTotal ? stageCurrent / stageTotal : 0;
  return (index + sub) / stages.length;
}

function labelOf({ kind, status, stage, stageCurrent, stageTotal, error }: PipelineRunRequest): string {
  switch (status) {
    case "queued":
      return "En file d'attente";
    case "running": {
      const label = STAGE_LABELS[stage ?? "fetching_rules"];
      return stage === "uploading_songs" && stageCurrent !== null && stageTotal !== null
        ? `${label} (${stageCurrent}/${stageTotal})`
        : label;
    }
    case "succeeded":
      return kind === "curation" ? "Appliquée" : "Terminée";
    case "failed":
      return `Échec : ${error ?? "erreur inconnue"}`;
    case "superseded":
      return "Déjà appliquée par le run nightly";
    case "cancelled":
      return "Annulée";
    case "expired":
      return "Expirée (aucun signe de vie depuis 30 min)";
  }
}

/** Current time, ticking every second while `ticking`; null on the server so hydration matches. */
function useNow(ticking: boolean) {
  const subscribe = useCallback(
    (onTick: () => void) => {
      if (!ticking) return () => {};
      const id = setInterval(onTick, 1000);
      return () => clearInterval(id);
    },
    [ticking],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 1000) * 1000,
    () => null,
  );
}

function durationOf({ status, startedOn, finishedOn }: PipelineRunRequest, now: number | null) {
  if (!startedOn || status === "queued") return null;
  if (finishedOn) return `en ${formatDuration(startedOn, finishedOn)}`;
  if (status === "running" && now !== null) return `depuis ${formatDuration(startedOn, now)}`;
  return null;
}

type Props = { pendingCount: number; initialRequest: PipelineRunRequest | null };

/** Launches a curation run or a full ingestion, follows its progress and cancels it. */
export default function PipelineRunPanel({ pendingCount, initialRequest }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  // skipGlobalError: the wrapper would otherwise resolve a failed poll to null, ending the progress tracking.
  const { data: request = null, refetch } = useQueryWithParse({
    queryKey: LATEST_QUERY_KEY,
    queryFn: () => fetch("pipeline/runs/latest/", true, false, {}, undefined, false, true),
    schema: PipelineRunRequestSchema.nullable(),
    context: "PipelineRunPanel",
    initialData: initialRequest,
    refetchInterval: (query) => (isActive(query.state.data) ? POLL_INTERVAL_MS : false),
  });
  // 409 (a run is active, or the run already ended) or 400 (nothing left to curate): show the up-to-date state.
  const onError = () => {
    refetch();
    router.refresh();
  };
  const onSuccess = (updated: PipelineRunRequest) => queryClient.setQueryData(LATEST_QUERY_KEY, updated);
  const launch = useValidatedMutation({
    inputSchema: z.enum(PIPELINE_RUN_KINDS),
    outputSchema: PipelineRunRequestSchema,
    mutationFn: (kind) =>
      fetch("pipeline/runs/", true, false, { method: "POST", body: JSON.stringify({ kind }) }, undefined, false, true),
    onSuccess,
    onError,
  });
  const cancel = useValidatedMutation({
    inputSchema: z.string().uuid(),
    outputSchema: PipelineRunRequestSchema,
    mutationFn: (uuid) =>
      fetch(`pipeline/runs/${uuid}/cancel/`, true, false, { method: "POST" }, undefined, false, true),
    onSuccess,
    onError,
  });

  const wasActive = useRef(isActive(request));
  useEffect(() => {
    // Refreshes the server-rendered counts (pending curation edits, latest imports) once the run lands.
    if (wasActive.current && !isActive(request)) router.refresh();
    wasActive.current = isActive(request);
  }, [request, router]);

  const active = isActive(request);
  const progress = request && progressOf(request);
  const now = useNow(request?.status === "running");
  const duration = request && durationOf(request, now);

  return (
    <section className="flex flex-col gap-2" aria-label="Runs du pipeline">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => launch.mutate("curation")}
          disabled={pendingCount === 0 || active || launch.isPending}
        >
          Appliquer la curation
        </Button>
        <Button
          onClick={() =>
            window.confirm("Lancer une ingestion complète ? Le run dure plusieurs heures.") && launch.mutate("full")
          }
          disabled={active || launch.isPending}
        >
          Lancer une ingestion complète
        </Button>
        {request && active && (
          <Button onClick={() => cancel.mutate(request.uuid)} disabled={request.cancelRequested || cancel.isPending}>
            {request.cancelRequested ? "Annulation demandée…" : "Annuler"}
          </Button>
        )}
      </div>
      {request && (
        <div className="flex flex-col gap-1">
          {progress !== null && (
            <progress value={progress} max={1} aria-label="Progression du run" className="w-full" />
          )}
          <p aria-live="polite" className={request.status === "failed" ? "text-red-600" : "text-gray-700"}>
            {KIND_LABELS[request.kind]} : {labelOf(request)}
          </p>
          <p className="text-sm text-gray-600">
            {originOf(request)}
            {duration && ` · ${duration}`}
          </p>
          {request.status === "running" && request.stage === "merging_songs" && (
            <p className="text-sm text-gray-600">Une annulation laisse la fusion déjà commencée aller à son terme.</p>
          )}
        </div>
      )}
      {[...launch.formErrors, ...cancel.formErrors].map((error, index) => (
        <p key={index} className="text-red-500">
          {error.message}
        </p>
      ))}
    </section>
  );
}
