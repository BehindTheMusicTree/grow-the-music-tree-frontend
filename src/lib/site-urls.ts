import { AUDIOMETA_FRONT_SUBDOMAIN, HTMT_API_SUBDOMAIN, ORG_DOMAIN } from "@behindthemusictree/assets";

function isProductionEnv(): boolean {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
}

function subdomainOrigin(label: string): string {
  const host = isProductionEnv() ? label : `${label}-staging`;
  return `https://${host}.${ORG_DOMAIN}`;
}

/**
 * HearTheMusicTree API base URL. Off Vercel (no `NEXT_PUBLIC_VERCEL_ENV`), honors
 * `NEXT_PUBLIC_BACKEND_BASE_URL` as a local/remote dev override; Vercel always sets that var,
 * so a stale value left over in a Vercel project's env settings can never shadow this on a deployment.
 */
export function getBackendBaseUrl(): string {
  if (!process.env.NEXT_PUBLIC_VERCEL_ENV && process.env.NEXT_PUBLIC_BACKEND_BASE_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  }
  const apiRootSegment = process.env.NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT;
  if (!apiRootSegment) throw new Error("NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT is required");
  if (!HTMT_API_SUBDOMAIN) throw new Error("HTMT_API_SUBDOMAIN is required");
  return `${subdomainOrigin(HTMT_API_SUBDOMAIN)}/${apiRootSegment.replace(/^\/+|\/+$/g, "")}/`;
}

/** AudioMeta web app URL. */
export function getAudiometaUrl(): string {
  if (!AUDIOMETA_FRONT_SUBDOMAIN) throw new Error("AUDIOMETA_FRONT_SUBDOMAIN is required");
  return subdomainOrigin(AUDIOMETA_FRONT_SUBDOMAIN);
}
