import "server-only";
import { fetchAsAdmin } from "@lib/admin-fetch";
import { PipelineRunRequestSchema, PipelineRunsPageSchema } from "@schemas/api/pipeline-runs";

/** Null when no pipeline run was ever requested. */
export async function fetchLatestPipelineRun() {
  const response = await fetchAsAdmin("pipeline/runs/latest/");
  if (!response.ok) throw new Error(`Failed to fetch the latest pipeline run: ${response.status}`);
  return response.status === 204 ? null : PipelineRunRequestSchema.parse(await response.json());
}

/** Null when `page` is past the last page. */
export async function fetchPipelineRuns(page: number) {
  const response = await fetchAsAdmin(`pipeline/runs/?page=${page}`);
  return response.ok ? PipelineRunsPageSchema.parse(await response.json()) : null;
}
