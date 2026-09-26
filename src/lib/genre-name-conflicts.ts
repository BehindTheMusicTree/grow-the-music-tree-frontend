import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import { GenreNameConflictGroupsSchema, type GenreNameConflictGroup } from "@schemas/api/genre-name-conflicts";

export async function fetchGenreNameConflictGroups(): Promise<GenreNameConflictGroup[]> {
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/genres/name-conflicts/`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to list genre name conflicts: ${response.status}`);
  return GenreNameConflictGroupsSchema.parse(await response.json());
}
