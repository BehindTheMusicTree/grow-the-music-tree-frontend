import { getServerEnv } from "@lib/env.server";

// grow-api's contract version (its settings.API_VERSION), not deploy config: the endpoint paths and
// zod schemas here are written against it, so bump it only together with a client migration.
const GROW_API_VERSION = "v1";

/**
 * GrowTheMusicTree API base URL, as seen by the `/api/grow-proxy` route handler.
 *
 * Deliberately does not use `@behindthemusictree/app-kit/transport`'s `buildBackendBaseUrl`:
 * that module unconditionally calls `React.createContext` at import time (for an internal
 * session context), which breaks in a Route Handler's non-React runtime.
 */
export function getGrowApiUpstreamBaseUrl(): string {
  return `${getServerEnv().GROW_API_ORIGIN}/${GROW_API_VERSION}/`;
}
