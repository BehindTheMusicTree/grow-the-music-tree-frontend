# Prototype/demo mode

`/prototype/*` is a read-only demo of the reference genre tree, backed by a second static-key
identity on `grow-the-music-tree-api` (`PROTOTYPE_USERNAME=prototype` /
`GROW_PROTOTYPE_API_KEY`), separate from the normal system-user identity.

## How it's wired

- `src/app/api/grow-prototype-proxy/[...path]/route.ts` mirrors `grow-proxy`'s route handler,
  attaching the server-only `GTMT_PROTOTYPE_API_KEY` (never `NEXT_PUBLIC_*`) as `X-API-Key`
  instead of `GTMT_API_KEY`.
- `getGrowPrototypeBackendBaseUrl()` (`src/lib/site-urls.ts`) returns `"/api/grow-prototype-proxy"`,
  the same-origin path pages/hooks under `/prototype/*` use instead of `getGrowBackendBaseUrl()`.
- `isPrototypeRoute(pathname)` (`src/lib/prototype-mode.ts`) is the single source of truth for
  "are we in prototype mode," used by `src/app/providers.tsx` (to pick which backend base URL the
  track player/library hit) and `AppContent.tsx` (to show `PrototypeModeBanner`).
- `src/components/features/genre-tree/GenreTreePage.tsx` is shared by both
  `/reference-genre-tree` (`readOnly={false}`) and `/prototype/reference-genre-tree`
  (`readOnly={true}`), passing `readOnly` through to `@behindthemusictree/app-kit`'s
  `GenreTreeView`, which hides write-action UI when true.

## Why this is separate from provider auth (Google/Spotify)

This is a static-key server-to-server auth path, not a user session. It has nothing to do with
`scope` (`"reference"` vs `"me"`) either — prototype mode still uses `scope="reference"`, just
against a different backend identity. The prototype key behaves identically to the system-user key
for reads; grow-api 403s any write made with it (`{"detail": "The prototype API key is read-only",
"code": "prototype_read_only"}`), which `GenreTreePage`'s `readOnly` prop pre-empts in the UI.
