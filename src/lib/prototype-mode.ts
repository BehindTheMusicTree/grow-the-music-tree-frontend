/**
 * Whether `pathname` is inside the read-only prototype/demo mode (`/prototype/*`), which points
 * at grow-api's separate static-key prototype identity. See `docs/prototype-mode.md`.
 */
export function isPrototypeRoute(pathname: string | null): boolean {
  return pathname?.startsWith("/prototype") ?? false;
}
