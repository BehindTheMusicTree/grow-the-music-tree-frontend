import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import { UnacceptedRootsSchema, type UnacceptedRoot } from "@schemas/api/genre-unaccepted-roots";

export async function fetchUnacceptedRoots(): Promise<UnacceptedRoot[]> {
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/genres/unaccepted-roots/`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to list unaccepted roots: ${response.status}`);
  return UnacceptedRootsSchema.parse(await response.json());
}
