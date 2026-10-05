import "server-only";
import { headers } from "next/headers";
import { getAdminIdToken } from "@lib/auth";
import { getGrowApiUpstreamBaseUrl } from "@lib/grow-api-upstream-url";

/** Throws on any error status but 404, which callers handle themselves. */
export async function fetchAsAdmin(path: string): Promise<Response> {
  const idToken = await getAdminIdToken({ headers: await headers() });
  if (!idToken) throw new Error(`Not signed in as admin, cannot fetch ${path}`);
  const response = await fetch(`${getGrowApiUpstreamBaseUrl().replace(/\/+$/, "")}/${path}`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok && response.status !== 404) throw new Error(`Failed to fetch ${path}: ${response.status}`);
  return response;
}
