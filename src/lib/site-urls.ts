import {
  AUDIOMETA_FRONT_SUBDOMAIN,
  GTMT_API_SUBDOMAIN,
  HTMT_API_SUBDOMAIN,
  ORG_DOMAIN,
} from "@behindthemusictree/brand";
import { buildBackendBaseUrl, buildSubdomainBaseUrl } from "@behindthemusictree/app-kit/transport";

function isProductionEnv(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

/**
 * HearTheMusicTree API base URL. Off Vercel (no `NEXT_PUBLIC_VERCEL_ENV`), honors
 * `NEXT_PUBLIC_BACKEND_BASE_URL` as a local/remote dev override; Vercel always sets that var,
 * so a stale value left over in a Vercel project's env settings can never shadow this on a deployment.
 */
export function getBackendBaseUrl(): string {
  if (!HTMT_API_SUBDOMAIN) throw new Error("HTMT_API_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  const apiRootSegment = process.env.NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT;
  if (!apiRootSegment) throw new Error("NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT is required");
  return buildBackendBaseUrl({
    apiSubdomain: HTMT_API_SUBDOMAIN,
    orgDomain: ORG_DOMAIN,
    apiRootSegment,
    isProduction: isProductionEnv(),
    overrideUrl: !process.env.NEXT_PUBLIC_VERCEL_ENV ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL : undefined,
  });
}

/**
 * GrowTheMusicTree API base URL. Off Vercel (no `NEXT_PUBLIC_VERCEL_ENV`), honors
 * `NEXT_PUBLIC_GROW_BACKEND_BASE_URL` as a local/remote dev override; Vercel always sets that var,
 * so a stale value left over in a Vercel project's env settings can never shadow this on a deployment.
 */
export function getGrowBackendBaseUrl(): string {
  if (!GTMT_API_SUBDOMAIN) throw new Error("GTMT_API_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  const apiRootSegment = process.env.NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT;
  if (!apiRootSegment) throw new Error("NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT is required");
  return buildBackendBaseUrl({
    apiSubdomain: GTMT_API_SUBDOMAIN,
    orgDomain: ORG_DOMAIN,
    apiRootSegment,
    isProduction: isProductionEnv(),
    overrideUrl: !process.env.NEXT_PUBLIC_VERCEL_ENV ? process.env.NEXT_PUBLIC_GROW_BACKEND_BASE_URL : undefined,
  });
}

/** AudioMeta web app URL. */
export function getAudiometaUrl(): string {
  if (!AUDIOMETA_FRONT_SUBDOMAIN) throw new Error("AUDIOMETA_FRONT_SUBDOMAIN is required");
  if (!ORG_DOMAIN) throw new Error("ORG_DOMAIN is required");
  return buildSubdomainBaseUrl({
    subdomain: AUDIOMETA_FRONT_SUBDOMAIN,
    orgDomain: ORG_DOMAIN,
    isProduction: isProductionEnv(),
  });
}
