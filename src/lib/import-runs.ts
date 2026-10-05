import "server-only";
import { fetchAsAdmin } from "@lib/admin-fetch";
import { ImportRunsPageSchema, LatestImportRunsSchema, type ImportKind } from "@schemas/api/import-runs";

export async function fetchLatestImportRuns() {
  const response = await fetchAsAdmin("pipeline/imports/latest/");
  if (!response.ok) throw new Error(`Failed to fetch latest import runs: ${response.status}`);
  return LatestImportRunsSchema.parse(await response.json());
}

/** Null when `page` is past the last page. */
export async function fetchImportRuns(page: number, kind?: ImportKind) {
  const query = new URLSearchParams({ page: String(page) });
  if (kind) query.set("kind", kind);
  const response = await fetchAsAdmin(`pipeline/imports/?${query}`);
  return response.ok ? ImportRunsPageSchema.parse(await response.json()) : null;
}
