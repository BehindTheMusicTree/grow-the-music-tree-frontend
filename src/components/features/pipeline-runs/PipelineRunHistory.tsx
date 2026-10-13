"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@behindthemusictree/ui";
import { AbsoluteTime, formatDuration } from "@components/features/import-runs/importedOn";
import { KIND_LABELS, originOf } from "@components/features/pipeline-runs/labels";
import type { PipelineRunRequest, PipelineRunsPage } from "@schemas/api/pipeline-runs";

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
              <TableHead>Démarré le</TableHead>
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
                <TableCell>{STATUS_LABELS[run.status]}</TableCell>
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
