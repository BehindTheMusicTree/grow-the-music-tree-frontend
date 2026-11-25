/**
 * Whether a session token was issued against the grow-api upstream currently configured.
 * A missing `upstream` (cookie from before the binding existed) fails closed.
 */
export function isBoundToUpstream(tokenUpstream: string | undefined, currentUpstream: string): boolean {
  return tokenUpstream !== undefined && tokenUpstream === currentUpstream;
}
