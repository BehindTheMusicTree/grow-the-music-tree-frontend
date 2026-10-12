import "server-only";
import { fetchAsAdmin } from "@lib/admin-fetch";
import { PipelineRunRequestSchema } from "@schemas/api/pipeline-runs";

/** Null when no pipeline run was ever requested. */
export async function fetchLatestPipelineRun() {
  const response = await fetchAsAdmin("pipeline/runs/latest/");
  if (!response.ok) throw new Error(`Failed to fetch the latest pipeline run: ${response.status}`);
  return response.status === 204 ? null : PipelineRunRequestSchema.parse(await response.json());
}
