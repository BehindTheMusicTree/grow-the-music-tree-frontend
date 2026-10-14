import type { PipelineRunKind, PipelineRunRequest } from "@schemas/api/pipeline-runs";

export const KIND_LABELS: Record<PipelineRunKind, string> = {
  curation: "Curation",
  full: "Ingestion complète",
};

export function originOf({ trigger, requestedBy }: Pick<PipelineRunRequest, "trigger" | "requestedBy">) {
  if (trigger === "scheduled") return "Nightly";
  return requestedBy ? `Manuel · ${requestedBy}` : "Manuel";
}
