import { AUDIOMETA_FRONT_SUBDOMAIN, ORG_DOMAIN } from "@behindthemusictree/brand";
import { buildSubdomainBaseUrl } from "@behindthemusictree/app-kit/transport";

/**
 * GrowTheMusicTree API base URL for client use — a same-origin path proxied by
 * `/api/grow-proxy`, which attaches the server-only `GTMT_API_KEY` grow-api requires on writes.
 * The real upstream host is resolved separately in `@lib/grow-api-upstream-url` (server-only,
 * used by the proxy route handler itself — see that file for why it can't reuse this module's
 * app-kit-based `buildBackendBaseUrl`).
 */
export function getGrowBackendBaseUrl(): string {
  return "/api/grow-proxy";
}

/**
 * AudioMeta web app URL. Coolify (both prod and staging) always sets `NEXT_PUBLIC_AUDIOMETA_URL`
 * as a buildtime var, which short-circuits everything below; the subdomain-derived fallback only
 * fires for local dev run without it, so it always targets staging.
 */
export function getAudiometaUrl(): string {
  const overrideUrl = process.env.NEXT_PUBLIC_AUDIOMETA_URL;
  if (overrideUrl) return overrideUrl;
  if (!AUDIOMETA_FRONT_SUBDOMAIN) throw new Error("AUDIOMETA_FRONT_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  return buildSubdomainBaseUrl({
    subdomain: AUDIOMETA_FRONT_SUBDOMAIN,
    orgDomain: ORG_DOMAIN,
    isProduction: false,
  });
}
