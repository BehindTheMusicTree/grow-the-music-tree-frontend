"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useValidatedMutation } from "@behindthemusictree/app-kit/transport";
import { Button, Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@behindthemusictree/ui";
import { AbsoluteTime, formatDuration } from "@components/features/import-runs/importedOn";
import { KIND_LABELS, asLatest, isPipelineRunActive, originOf } from "@components/features/pipeline-runs/labels";
import { getGrowBackendBaseUrl } from "@lib/site-urls";
import {
  PIPELINE_RUN_LATEST_QUERY_KEY,
  PipelineRunConflictSchema,
  PipelineRunRequestSchema,
  type PipelineRunLatest,
  type PipelineRunRequest,
  type PipelineRunsPage,
} from "@schemas/api/pipeline-runs";

class RecoveryRefused extends Error {}

const STATUS_LABELS: Record<PipelineRunRequest["status"], string> = {
  queued: "En file d'attente",
  running: "En cours",
  succeeded: "Réussi",
  failed: "Échec",
  superseded: "Remplacé par le nightly",
  cancelled: "Annulé",
  expired: "Expiré",
};

export default function PipelineRunHistory({ runs }: { runs: PipelineRunsPage }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: active } = useQuery<PipelineRunLatest | null, Error, boolean>({
    queryKey: PIPELINE_RUN_LATEST_QUERY_KEY,
    queryFn: skipToken,
    select: isPipelineRunActive,
  });
  const recovery = useValidatedMutation({
    inputSchema: z.string().uuid(),
    outputSchema: PipelineRunRequestSchema,
    mutationFn: async (sourceRunUuid) => {
      const response = await fetch(`${getGrowBackendBaseUrl()}/pipeline/runs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "sync_artists", sourceRunUuid }),
      });
      if (response.ok) return response.json();
      if (response.status === 409) {
        const conflict = PipelineRunConflictSchema.safeParse(await response.json());
        if (conflict.success) throw new RecoveryRefused(conflict.data.details.message);
      }
      throw new Error(`Grow returned HTTP ${response.status}`);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<PipelineRunLatest | null>(
        PIPELINE_RUN_LATEST_QUERY_KEY,
        (cached) => asLatest(updated, cached),
      );
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: PIPELINE_RUN_LATEST_QUERY_KEY });
      router.refresh();
    },
  });

  function navigate(page: number) {
    const query = new URLSearchParams(searchParams);
    if (page > 1) query.set("runsPage", String(page));
    else query.delete("runsPage");
    const search = query.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-2">
      {runs.results.length === 0 ? (
        <p>Aucun run pour l&apos;instant</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Durée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.results.map((run) => (
              <TableRow key={run.uuid}>
                <TableCell>
                  <AbsoluteTime iso={run.startedOn ?? run.requestedOn} />
                </TableCell>
                <TableCell>{KIND_LABELS[run.kind]}</TableCell>
                <TableCell>{originOf(run)}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span>{STATUS_LABELS[run.status]}</span>
                    {run.artistsRecovery?.songsApplied && !run.artistsRecovery.artistsApplied && (
                      <span>Chansons importées · Artistes en attente</span>
                    )}
                    {run.artistsRecovery?.eligible ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={active || recovery.isPending}
                        onClick={() => recovery.mutate(run.uuid)}
                      >
                        Importer les artistes de ce Gold
                      </Button>
                    ) : run.artistsRecovery?.reason && (
                      <span>{run.artistsRecovery.reason}</span>
                    )}
                    {recovery.isError && recovery.variables === run.uuid && (
                      <span role="alert">
                        {recovery.error instanceof RecoveryRefused
                          ? recovery.error.message
                          : "Impossible de demander l’import des artistes."}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{run.startedOn && run.finishedOn ? formatDuration(run.startedOn, run.finishedOn) : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination currentPage={runs.page} totalPages={runs.totalPages} onPageChange={navigate} />
    </div>
  );
}
