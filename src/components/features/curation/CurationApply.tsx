"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@behindthemusictree/ui";
import { useFetchWrapper, useQueryWithParse, useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import { CURATION_APPLY_STAGES, CurationApplyRequestSchema, type CurationApplyRequest } from "@schemas/api/curation";

const POLL_INTERVAL_MS = 5000;
const LATEST_QUERY_KEY = ["curationApply", "latest"];

const STAGE_LABELS: Record<(typeof CURATION_APPLY_STAGES)[number], string> = {
  fetching_rules: "Récupération des règles",
  building_genres: "Construction des genres",
  matching_songs: "Rattachement des morceaux",
  importing_tree: "Import de l'arbre",
  uploading_songs: "Envoi des morceaux",
  merging_songs: "Fusion des morceaux",
};

const isActive = (request: CurationApplyRequest | null | undefined) =>
  request?.status === "queued" || request?.status === "running";

/** Fraction of the run done, or null when there's no bar to show. */
function progressOf({ status, stage, stageCurrent, stageTotal }: CurationApplyRequest): number | null {
  if (status === "succeeded") return 1;
  if (status === "queued") return 0;
  if (status !== "running") return null;
  const index = stage ? CURATION_APPLY_STAGES.indexOf(stage) : 0;
  const sub = stage === "uploading_songs" && stageCurrent !== null && stageTotal ? stageCurrent / stageTotal : 0;
  return (index + sub) / CURATION_APPLY_STAGES.length;
}

function labelOf({ status, stage, stageCurrent, stageTotal, error }: CurationApplyRequest): string {
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
      return "Appliquée";
    case "failed":
      return `Échec : ${error ?? "erreur inconnue"}`;
    case "superseded":
      return "Déjà appliquée par le run nightly";
  }
}

type Props = { pendingCount: number; initialRequest: CurationApplyRequest | null };

/** Launches a curation run (limited pipeline stages) and follows its progress. */
export default function CurationApply({ pendingCount, initialRequest }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { fetch } = useFetchWrapper(getGrowBackendBaseUrl);
  // skipGlobalError: the wrapper would otherwise resolve a failed poll to null, ending the progress tracking.
  const { data: request = null, refetch } = useQueryWithParse({
    queryKey: LATEST_QUERY_KEY,
    queryFn: () => fetch("curation/apply/latest/", true, false, {}, undefined, false, true),
    schema: CurationApplyRequestSchema.nullable(),
    context: "CurationApply",
    initialData: initialRequest,
    refetchInterval: (query) => (isActive(query.state.data) ? POLL_INTERVAL_MS : false),
  });
  const { mutate, formErrors, isPending } = useValidatedMutation({
    inputSchema: z.undefined(),
    outputSchema: CurationApplyRequestSchema,
    mutationFn: () => fetch("curation/apply/", true, false, { method: "POST" }, undefined, false, true),
    onSuccess: (created) => queryClient.setQueryData(LATEST_QUERY_KEY, created),
    // 409 (another run is active) or 400 (the nightly applied everything meanwhile): show the up-to-date state.
    onError: () => {
      refetch();
      router.refresh();
    },
  });

  const wasActive = useRef(isActive(request));
  useEffect(() => {
    // Refreshes CurationStatus's pending count once the run lands.
    if (wasActive.current && !isActive(request)) router.refresh();
    wasActive.current = isActive(request);
  }, [request, router]);

  const progress = request && progressOf(request);

  return (
    <section className="flex flex-col gap-2" aria-label="Application de la curation">
      <div>
        <Button onClick={() => mutate(undefined)} disabled={pendingCount === 0 || isActive(request) || isPending}>
          Appliquer la curation
        </Button>
      </div>
      {request && (
        <div className="flex flex-col gap-1">
          {progress !== null && (
            <progress value={progress} max={1} aria-label="Progression de la curation" className="w-full" />
          )}
          <p aria-live="polite" className={request.status === "failed" ? "text-red-600" : "text-gray-700"}>
            {labelOf(request)}
          </p>
        </div>
      )}
      {formErrors.map((error, index) => (
        <p key={index} className="text-red-500">
          {error.message}
        </p>
      ))}
    </section>
  );
}
