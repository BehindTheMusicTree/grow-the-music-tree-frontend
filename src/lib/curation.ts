import "server-only";
import { fetchAsAdmin } from "@lib/admin-fetch";
import {
  CurationEntriesPageSchema,
  CurationHistoryPageSchema,
  CurationListsSchema,
  CurationRulesSchema,
  CurationStatusSchema,
  type CurationList,
  type CurationOrdering,
} from "@schemas/api/curation";

export const CURATION_PAGE_SIZE = 100;

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

export type CurationHistoryFilter = { list?: string; entry?: string; itemId?: string };

/** Null when `page` is past the last page. */
export async function fetchCurationHistory(
  { list, entry, itemId }: CurationHistoryFilter,
  { page, pageSize }: { page: number; pageSize: number },
) {
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (list) query.set("list", list);
  if (entry) query.set("entry", entry);
  if (itemId) query.set("item_id", itemId);
  const response = await fetchAsAdmin(`curation/history/?${query}`);
  return response.ok ? CurationHistoryPageSchema.parse(await response.json()) : null;
}

export async function fetchCurationStatus() {
  const response = await fetchAsAdmin("curation/status/");
  if (!response.ok) throw new Error(`Failed to fetch curation status: ${response.status}`);
  return CurationStatusSchema.parse(await response.json());
}
