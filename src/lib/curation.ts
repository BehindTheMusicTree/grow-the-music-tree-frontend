import "server-only";
import { headers } from "next/headers";
import { getAdminIdToken } from "@lib/auth";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import {
  CurationEntriesPageSchema,
  CurationListsSchema,
  CurationRulesSchema,
  type CurationList,
  type CurationOrdering,
} from "@schemas/api/curation";

export const CURATION_PAGE_SIZE = 100;

async function fetchAsAdmin(path: string): Promise<Response> {
  const idToken = await getAdminIdToken({ headers: await headers() });
  if (!idToken) throw new Error(`Not signed in as admin, cannot fetch ${path}`);
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok && response.status !== 404) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response;
}

export async function fetchCurationLists(): Promise<CurationList[]> {
  const response = await fetchAsAdmin("curation/lists/");
  if (!response.ok) throw new Error(`Failed to list curation lists: ${response.status}`);
  return CurationListsSchema.parse(await response.json());
}

/** Null when `page` is past the last page, e.g. after deleting every entry of the last page. */
export async function fetchCurationEntries(
  listName: string,
  { page, q, ordering }: { page: number; q: string; ordering: CurationOrdering },
) {
  const query = new URLSearchParams({ page: String(page), page_size: String(CURATION_PAGE_SIZE), ordering });
  if (q) query.set("q", q);
  const response = await fetchAsAdmin(`curation/${encodeURIComponent(listName)}/entries/?${query}`);
  return response.ok ? CurationEntriesPageSchema.parse(await response.json()) : null;
}

export async function fetchCurationRules(itemId: string) {
  const response = await fetchAsAdmin(`curation/rules/?${new URLSearchParams({ item_id: itemId })}`);
  if (!response.ok) throw new Error(`Failed to fetch curation rules of ${itemId}: ${response.status}`);
  return CurationRulesSchema.parse(await response.json());
}
