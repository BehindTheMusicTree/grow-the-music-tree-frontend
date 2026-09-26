import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";

export type ConflictingGenre = {
  uuid: string;
  name: string;
  parent: { uuid: string; name: string } | null;
};

// ponytail: first page only (max 100); paginate if conflicts ever exceed that.
export async function fetchGenreNameConflicts(): Promise<{ count: number; results: ConflictingGenre[] }> {
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/genres/?hasNameConflict=true&pageSize=100`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Failed to list genre name conflicts: ${response.status}`);
  return response.json();
}
