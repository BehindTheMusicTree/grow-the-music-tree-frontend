import { GTMT_API_SUBDOMAIN, ORG_DOMAIN } from "@behindthemusictree/brand";

/**
 * GrowTheMusicTree API base URL, as seen by the `/api/grow-proxy` route handler.
 *
 * Deliberately does not use `@behindthemusictree/app-kit/transport`'s `buildBackendBaseUrl`:
 * that module unconditionally calls `React.createContext` at import time (for an internal
 * session context), which breaks in a Route Handler's non-React runtime. This mirrors its
 * logic locally instead.
 */
export function getGrowApiUpstreamBaseUrl(): string {
  const overrideUrl = !process.env.NEXT_PUBLIC_VERCEL_ENV ? process.env.NEXT_PUBLIC_GROW_BACKEND_BASE_URL : undefined;
  if (overrideUrl) return overrideUrl;

  if (!GTMT_API_SUBDOMAIN) throw new Error("GTMT_API_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  const apiRootSegment = process.env.NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT;
  if (!apiRootSegment) throw new Error("NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT is required");

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const host = isProduction ? GTMT_API_SUBDOMAIN : `${GTMT_API_SUBDOMAIN}-staging`;
  return `https://${host}.${ORG_DOMAIN}/${apiRootSegment.replace(/^\/+|\/+$/g, "")}/`;
}
