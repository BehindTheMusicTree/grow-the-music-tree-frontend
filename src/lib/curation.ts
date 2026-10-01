import "server-only";
import { headers } from "next/headers";
import { getAdminIdToken } from "@lib/auth";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";
import { CurationEntriesPageSchema, CurationListsSchema, type CurationList } from "@schemas/api/curation";

export const CURATION_PAGE_SIZE = 100;

async function fetchAsAdmin(path: string): Promise<unknown> {
  const idToken = await getAdminIdToken({ headers: await headers() });
  if (!idToken) throw new Error(`Not signed in as admin, cannot fetch ${path}`);
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response.json();
}

export async function fetchCurationLists(): Promise<CurationList[]> {
  return CurationListsSchema.parse(await fetchAsAdmin("curation/lists/"));
}

export async function fetchCurationEntries(listName: string, page: number) {
  return CurationEntriesPageSchema.parse(
    await fetchAsAdmin(
      `curation/${encodeURIComponent(listName)}/entries/?page=${page}&page_size=${CURATION_PAGE_SIZE}`,
    ),
  );
}
