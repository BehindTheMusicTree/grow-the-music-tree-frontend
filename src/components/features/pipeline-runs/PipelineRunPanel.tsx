"use client";

import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button, StepList } from "@behindthemusictree/ui";
import { useFetchWrapper, useQueryWithParse, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import { formatDuration } from "@components/features/import-runs/importedOn";
import {
  KIND_LABELS, STAGE_LABELS, UPLOAD_STAGES, WIKIDATA_JOIN_LABEL, foregroundStepDetails, originOf, stepsOf,
  wikidataRetryLabel, wikidataStepsOf,
} from "@components/features/pipeline-runs/labels";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  PIPELINE_RUN_KINDS,
  PIPELINE_RUN_STAGES,
  stageIndexOf,
  PipelineRunLatestSchema,
  PipelineRunRequestSchema,
  type ImportProgress,
  type PipelineRunKind,
  type PipelineRunLatest,
  type PipelineRunRequest,
} from "@schemas/api/pipeline-runs";

const POLL_INTERVAL_MS = 5000;
const LATEST_QUERY_KEY = ["pipelineRuns", "latest"];

const isActive = (request: PipelineRunRequest | null | undefined) =>
  request?.status === "queued" || request?.status === "running";

/** Each stage weighs its median duration; a stage without one takes the median of the known ones, and no medians means equal weights. */
function stageWeights(kind: PipelineRunKind, typical: PipelineRunLatest["typicalStageSeconds"]): number[] {
  const medians = PIPELINE_RUN_STAGES[kind].map((stage) => typical?.foreground[stage]);
  const known = medians.filter((median): median is number => median !== undefined).sort((a, b) => a - b);
  if (known.length === 0) return medians.map(() => 1);
  const middle = known.length >> 1;
  const fallback = known.length % 2 ? known[middle] : (known[middle - 1] + known[middle]) / 2;
  return medians.map((median) => median ?? fallback);
}

/** Fraction of the run done, or null when there's no bar to show. */
function progressOf({ kind, status, stage, stageCurrent, stageTotal, typicalStageSeconds }: PipelineRunLatest): number | null {
  if (status === "succeeded") return 1;
  if (status === "queued") return 0;
  if (status !== "running") return null;
  const weights = stageWeights(kind, typicalStageSeconds);
  const index = stage ? Math.max(stageIndexOf(kind, stage), 0) : 0;
  const sub = stage && UPLOAD_STAGES.includes(stage) && stageCurrent !== null && stageTotal ? stageCurrent / stageTotal : 0;
  const done = weights.slice(0, index).reduce((sum, weight) => sum + weight, 0) + weights[index] * sub;
  return done / weights.reduce((sum, weight) => sum + weight, 0);
}

function labelOf({ kind, status, stage, stageCurrent, stageTotal, error, stepTelemetry }: PipelineRunRequest): string {
  switch (status) {
    case "queued":
      return "En file d'attente";
    case "running": {
      const waitingForWikidata = stage === "building_genres" &&
        stepTelemetry?.foreground.some((step) => step.stage === "building_genres");
      const label = waitingForWikidata ? WIKIDATA_JOIN_LABEL : STAGE_LABELS[stage ?? "fetching_rules"];
      return stage && UPLOAD_STAGES.includes(stage) && stageCurrent !== null && stageTotal !== null
        ? `${label} (${stageCurrent}/${stageTotal})`
        : label;
    }
    case "succeeded":
      return kind === "curation" ? "Appliquée" : kind === "sync" ? "Réimportée" : "Terminée";
    case "failed":
      if (stage === "ingesting_geohistory") return `Échec — ${STAGE_LABELS[stage]} : ${error ?? "erreur inconnue"}`;
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

const START_DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "Europe/Paris" });
const START_TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

function durationOf({ status, startedOn, finishedOn }: PipelineRunRequest, now: number | null) {
  if (!startedOn || status === "queued") return null;
  const startedAt = new Date(startedOn);
  const started = `démarré le ${START_DATE_FORMAT.format(startedAt)} à ${START_TIME_FORMAT.format(startedAt)}`;
  if (finishedOn) return `${started} · durée totale : ${formatDuration(startedOn, finishedOn)}`;
  if (status === "running" && now !== null) return `${started} · durée écoulée : ${formatDuration(startedOn, now)}`;
  return started;
}

const TERMINAL_IMPORT_STATES: readonly ImportProgress["state"][] = ["succeeded", "failed", "interrupted"];

/** Progress of the merge Grow runs for the current pipeline run, hidden once its attempt is over. */
function ImportProgressNote({ progress, now }: { progress: ImportProgress; now: number | null }) {
  if (TERMINAL_IMPORT_STATES.includes(progress.state)) return null;
  const parts = [
    progress.step
      ? `Fusion : étape ${progress.step}${progress.stepStartedAt && now !== null ? ` depuis ${formatDuration(progress.stepStartedAt, now)}` : ""}`
      : "Fusion : en attente",
    `tentative ${progress.attempt}`,
    progress.heartbeatAt && now !== null ? `dernier signe de vie il y a ${formatDuration(progress.heartbeatAt, now)}` : null,
    progress.sql.waitEventType
      ? `attente SQL : ${progress.sql.waitEventType} (${progress.sql.blockerCount ?? 0} bloquant${progress.sql.blockerCount === 1 ? "" : "s"})`
      : null,
    progress.bootstrap ? "bootstrap (premier import du graphe, peut durer plusieurs heures)" : null,
  ];
  return (
    <>
      <p className="text-body text-gray-600">{parts.filter(Boolean).join(" · ")}</p>
      {progress.observabilityStale && (
        <p role="status" className="text-body text-red-600">
          Aucun signe de vie récent de la fusion : l&rsquo;avancement affiché peut être périmé.
        </p>
      )}
    </>
  );
}

type Props = { pendingCount: number; initialRequest: PipelineRunLatest | null };

/** Launches a curation run, a full ingestion or a Gold sync, follows its progress and cancels it. */
export default function PipelineRunPanel({ pendingCount, initialRequest }: Props) {
  const wikidataHeadingId = useId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  // skipGlobalError: the wrapper would otherwise resolve a failed poll to null, ending the progress tracking.
  const { data: request = null, refetch } = useQueryWithParse({
    queryKey: LATEST_QUERY_KEY,
    queryFn: () => fetch("pipeline/runs/latest/", true, false, {}, undefined, false, true),
    schema: PipelineRunLatestSchema.nullable(),
    context: "PipelineRunPanel",
    initialData: initialRequest,
    refetchInterval: (query) => (isActive(query.state.data) ? POLL_INTERVAL_MS : false),
  });
  // 409 (a run is active, or the run already ended) or 400 (nothing left to curate): show the up-to-date state.
  const onError = () => {
    refetch();
    router.refresh();
  };
  // The two latest-only keys come with the next poll.
  const onSuccess = (updated: PipelineRunRequest) =>
    queryClient.setQueryData(LATEST_QUERY_KEY, { ...updated, activeImport: null, typicalStageSeconds: null });
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

  const runKey = request && `${request.uuid}:${request.status}`;
  const lastRunKey = useRef(runKey);
  useEffect(() => {
    // Refreshes the server-rendered run history and counts (pending curation edits, latest imports) on every
    // launch and status change, so the history follows the live run instead of catching up once it lands.
    if (lastRunKey.current === runKey) return;
    lastRunKey.current = runKey;
    router.refresh();
  }, [runKey, router]);

  const active = isActive(request);
  const progress = request && progressOf(request);
  const now = useNow(request?.status === "running");
  const duration = request && durationOf(request, now);
  const legacySteps = request && stepsOf(request);
  const steps = legacySteps && request ? foregroundStepDetails(legacySteps, request, now) : [];
  const wikidataSteps = request ? wikidataStepsOf(request, now) : [];
  const retry = request && wikidataRetryLabel(request);

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
        <Button onClick={() => launch.mutate("sync")} disabled={active || launch.isPending}>
          Réimporter le dernier Gold
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
          {steps.length > 0 && (
            <StepList
              aria-label="Étapes du run"
              statusLabels={{ done: "terminée", current: "en cours", pending: "à venir", failed: "interrompue" }}
              steps={steps}
            />
          )}
          {wikidataSteps.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              <p id={wikidataHeadingId} className="text-body font-medium">Chaîne Wikidata et Geohistory</p>
              <StepList
                aria-labelledby={wikidataHeadingId}
                statusLabels={{ done: "terminée", current: "en cours", pending: "à venir", failed: "interrompue" }}
                steps={wikidataSteps}
              />
            </div>
          )}
          {request.status === "running" && request.activeImport && (
            <ImportProgressNote progress={request.activeImport} now={now} />
          )}
          {retry && <p role="status" className="text-body text-gray-600">{retry}</p>}
          <p aria-live="polite" className={request.status === "failed" ? "text-red-600" : "text-gray-700"}>
            {KIND_LABELS[request.kind]} : {labelOf(request)}
          </p>
          <p className="text-body text-gray-600">
            {originOf(request)}
            {duration && ` · ${duration}`}
          </p>
          {request.status === "running" && (request.stage === "importing_graph" || request.stage === "merging_songs" || request.stage === "merging_artists" || request.stage === "merging_region_map") && (
            <p className="text-body text-gray-600">Une annulation laisse la fusion déjà commencée aller à son terme.</p>
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
