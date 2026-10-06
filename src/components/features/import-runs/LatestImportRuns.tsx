import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@behindthemusictree/ui";
import { AbsoluteTime, formatRelative } from "@components/features/import-runs/importedOn";
import { IMPORT_KIND_LABELS, type LatestImportRuns as Runs } from "@schemas/api/import-runs";

const ROWS = [
  ["canonical_tree", "canonicalTree"],
  ["regional_tree", "regionalTree"],
  ["songs", "songs"],
  ["unresolved_genre_tags", "unresolvedGenreTags"],
] as const;

export default function LatestImportRuns({ runs, now }: { runs: Runs; now: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kind</TableHead>
          <TableHead>Last import</TableHead>
          <TableHead>Count</TableHead>
          <TableHead>Skipped</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map(([kind, key]) => {
          const run = runs[key];
          return (
            <TableRow key={kind}>
              <TableCell>{IMPORT_KIND_LABELS[kind]}</TableCell>
              <TableCell>
                {run ? (
                  <>
                    {formatRelative(run.importedOn, now)} (<AbsoluteTime iso={run.importedOn} />)
                  </>
                ) : (
                  "never"
                )}
              </TableCell>
              <TableCell>{run?.count ?? "—"}</TableCell>
              <TableCell>{run?.skippedCount ?? "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
