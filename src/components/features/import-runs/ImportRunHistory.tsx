"use client";

import { usePathname, useRouter } from "next/navigation";
import { Pagination, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@behindthemusictree/ui";
import { AbsoluteTime } from "@components/features/import-runs/importedOn";
import { IMPORT_KIND_LABELS, ImportKindSchema, type ImportKind, type ImportRunsPage } from "@schemas/api/import-runs";

export default function ImportRunHistory({ runs, kind }: { runs: ImportRunsPage; kind?: ImportKind }) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(nextKind: ImportKind | undefined, page: number) {
    const query = new URLSearchParams();
    if (nextKind) query.set("kind", nextKind);
    if (page > 1) query.set("page", String(page));
    const search = query.toString();
    router.push(`${pathname}${search ? `?${search}` : ""}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        Kind
        <select
          value={kind ?? ""}
          onChange={(event) => navigate(ImportKindSchema.optional().parse(event.target.value || undefined), 1)}
          className="px-2 py-1 border border-gray-300 rounded-md"
        >
          <option value="">All</option>
          {ImportKindSchema.options.map((option) => (
            <option key={option} value={option}>
              {IMPORT_KIND_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
      {runs.results.length === 0 ? (
        <p>No imports yet</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imported on</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Skipped</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.results.map((run) => (
              <TableRow key={`${run.kind}-${run.importedOn}`}>
                <TableCell>
                  <AbsoluteTime iso={run.importedOn} />
                </TableCell>
                <TableCell>{IMPORT_KIND_LABELS[run.kind]}</TableCell>
                <TableCell>{run.count}</TableCell>
                <TableCell>{run.skippedCount ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination currentPage={runs.page} totalPages={runs.totalPages} onPageChange={(page) => navigate(kind, page)} />
    </div>
  );
}
