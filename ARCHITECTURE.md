# Architecture

Internal, code-level walkthrough of how this app is put together and why. For what the app does,
how to build/run/deploy it, and repo conventions, see [README.md](README.md), [AGENTS.md](AGENTS.md)
(a.k.a. `CLAUDE.md`, symlinked), and [docs/](docs/) — this file links to those rather than repeating
them, and only covers the parts not already documented elsewhere.

## App Router layout

```
src/app/
├── layout.tsx              # Root layout: <html>/<body>, fonts, metadata, global CSS imports
├── page.tsx                 # "/" — redirect("/reference-genre-tree"), no route group
├── globals.css
├── providers.tsx             # Client component: React Query, player, popup, track-list providers
├── AppContent.tsx            # Client component: header, player footer, sidebar, prototype banner
├── health/route.ts           # GET /health — { status: "ok" }, used by Coolify's healthcheck
├── api/
│   ├── grow-proxy/[...path]/route.ts             # Server-only proxy to grow-the-music-tree-api
│   └── grow-prototype-proxy/[...path]/route.ts   # Same, against the prototype identity
└── (app)/                    # Route group: everything wrapped in Providers + AppContent
    ├── layout.tsx
    ├── about/page.tsx
    ├── reference-genre-tree/page.tsx
    └── prototype/
        ├── page.tsx
        └── reference-genre-tree/page.tsx
```

`(app)` exists purely to scope `Providers`/`AppContent` (React Query, player state, the app shell
chrome) to the pages that need them, while `/` and `/health` stay outside that wrapping — `/`
because it's just a redirect, `/health` because Coolify's healthcheck hits it directly and it must
stay a trivial, dependency-free route (see [Build/deploy](#builddeploy) below).

Canonical path constants live in `src/lib/constants/routes.ts` (`PATHS.REFERENCE_GENRE_TREE`,
`PATHS.PROTOTYPE_REFERENCE_GENRE_TREE`, etc.) — reach for these instead of hardcoding path strings.

**Login/personal-library pages do not exist anymore.** `/account`, `/auth/{google,spotify}/callback`,
`/me-genre-tree`, `/me-uploaded-library`, `/spotify-library`, `/genre-playlists` and the
`AuthCallbackHandler`/`SessionProvider`-driven Google/Spotify login flow that served them were
removed in v2.4.0 (see `CHANGELOG.md`) — `grow-the-music-tree-api` is single-tenant with no
per-user account model, so per-user auth was never going to be built against it; personal-library
features live in `hear-the-music-tree-frontend` instead. `docs/pages/account.md`,
`spotify-library.md`, `my-genre-tree.md`, and `spotify-auth-callback.md` under `docs/pages/`
describe this removed feature and are stale.

`@behindthemusictree/app-kit/auth`'s `SessionProvider` is still mounted in `providers.tsx` (app-kit
requires it as a context ancestor for other hooks it exports), but nothing in this app drives it —
there's no login UI, no `useSpotifyAuth`/`useGoogleAuth`, and `AppContent.tsx` passes
`routeRequiresAuth: false` / `routeRequiresSpotify: false` and no-op renderers to
`useConnectivityErrorPopup` for every auth-shaped popup case.

## Talking to `grow-the-music-tree-api`

The backend requires an `X-API-Key` header (`grow-the-music-tree-api`'s `GROW_API_KEY`/
`GROW_PROTOTYPE_API_KEY`). This app never puts that key in the browser — two Next.js Route
Handlers proxy every request server-side, attaching the key there:

- `src/app/api/grow-proxy/[...path]/route.ts` — reads `process.env.GTMT_API_KEY` (throws if unset),
  forwards `GET`/`POST`/`PUT`/`DELETE` to `getGrowApiUpstreamBaseUrl()` (`src/lib/grow-api-upstream-url.ts`)
  with `X-API-Key` attached, and streams the upstream response straight back.
- `src/app/api/grow-prototype-proxy/[...path]/route.ts` — identical shape, reads
  `process.env.GTMT_PROTOTYPE_API_KEY` instead. See [docs/prototype-mode.md](docs/prototype-mode.md).

Client code never calls grow-api directly; it calls same-origin paths returned by
`src/lib/site-urls.ts`:

- `getGrowBackendBaseUrl()` → `"/api/grow-proxy"`
- `getGrowPrototypeBackendBaseUrl()` → `"/api/grow-prototype-proxy"`

`src/app/providers.tsx` picks between the two per-request based on `isPrototypeRoute(pathname)`
(`src/lib/prototype-mode.ts`), and passes the chosen base URL into `@behindthemusictree/app-kit`'s
`TrackListProvider` and its own `useLoadTrack` hook (used by the player).

`getGrowApiUpstreamBaseUrl()` (server-only, used inside the Route Handler, not exported to client
code) resolves the *real* upstream host — it deliberately reimplements `app-kit/transport`'s
`buildBackendBaseUrl` logic locally rather than importing it, because that module calls
`React.createContext` at import time and Route Handlers aren't a React runtime.

Both `GTMT_API_KEY` and `GTMT_PROTOTYPE_API_KEY` are **server-only, runtime** env vars — read via
`process.env` at request time, never `NEXT_PUBLIC_*`, never baked into the client bundle. See
[docs/DEPLOYMENT.md §2-4](docs/DEPLOYMENT.md#2-build-time-vs-runtime-environment-variables) for the
full build-time-vs-runtime distinction and how Coolify wires them in.

## Prototype/read-only mode

`/prototype/*` is a second, read-only surface backed by grow-api's separate `prototype` static-key
identity. Full design in [docs/prototype-mode.md](docs/prototype-mode.md); the pieces that matter
for tracing code:

- `isPrototypeRoute(pathname)` (`src/lib/prototype-mode.ts`) is the single source of truth for "are
  we under `/prototype`" — a plain `pathname?.startsWith("/prototype")`.
- `AppContent.tsx` renders `PrototypeModeBanner` when `isPrototypeRoute` is true.
- `src/components/features/genre-tree/GenreTreePage.tsx` is shared between
  `/reference-genre-tree` and `/prototype/reference-genre-tree`; the only difference is the
  `readOnly` prop it passes through to app-kit's `GenreTreeView`, which hides write-action UI.
  Grow-api itself also 403s any write attempted with the prototype key
  (`{"code": "prototype_read_only"}`) — the UI gating is a courtesy, not the enforcement boundary.

This is unrelated to the (now-removed) provider-auth machinery — it's a static server-to-server
key, not a user session, and it doesn't touch the app-kit `Scope` (`"reference"` vs `"me"`)
concept either.

## State management

- **Server state**: TanStack Query (`@tanstack/react-query`), one `QueryClient` (`queryClient` from
  `@behindthemusictree/app-kit/transport`) wrapping the whole app in `providers.tsx`. Query
  hooks/keys for the genre tree and library live in app-kit (`libraryEndpoints`,
  `libraryQueryKeys`) and are parameterized per-page with the right scope/backend base URL — see
  `useLoadTrack` in `providers.tsx` for the pattern.
- **App-kit-owned client state**: player state (`PlayerProvider`/`usePlayer`), popups
  (`PopupProvider`/`usePopup`), track-list sidebar visibility (`TrackListSidebarVisibilityProvider`)
  — all from `@behindthemusictree/app-kit`, composed in `providers.tsx`. This app supplies the
  `loadTrack` callback and the list/detail endpoints; app-kit owns the state shape.
- **Local React context**: `GenreTreeViewModeProvider` (`src/contexts/`) shares the Stacked/Wheel
  tree view-mode toggle between `AppHeader` and the tree page, since the toggle itself renders in
  the header but the tree page needs to read it.
- No Redux/Zustand/Jotai — nothing beyond React Query + the above context providers.

## Build/deploy

Multi-stage `Dockerfile`: a `builder` stage (`node:20-alpine`, pnpm, `pnpm build` against
`output: "standalone"`) and a slim `runner` stage that copies only the standalone output and runs
`node server.js`. Full Coolify build/runtime env var setup is in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md); the one constraint that lives only in the Dockerfile's
comments and is easy to regress:

- **`apk add curl` in the `runner` stage** — Coolify's post-deploy healthcheck runs `curl`/`wget`
  *inside* the container against `/health`; plain `node:20-alpine` ships neither, so without this
  the healthcheck always fails and Coolify rolls the deploy back. Installed with a 3-attempt retry
  to ride out transient Alpine mirror/TLS blips.
- **`ENV HOSTNAME=0.0.0.0` in the `runner` stage** — Docker auto-sets `$HOSTNAME` to the container
  ID, and Next's standalone `server.js` binds to `process.env.HOSTNAME` when set, instead of all
  interfaces. Left unset, the healthcheck's `localhost` request from inside the same container gets
  `Connection refused`.

Both caused a real staging/production rollback loop before being fixed (v2.4.0, see
`CHANGELOG.md`'s "Fixed" entries and `AGENTS.md`'s "Critical rules" section) — `/health`
(`src/app/health/route.ts`) must stay a dependency-free `{ status: "ok" }` handler, and neither
Dockerfile line should be removed as part of an unrelated cleanup.

## Testing

Vitest + Testing Library (happy-dom environment), tests co-located next to source as
`*.test.ts(x)`. Config: [`vitest.config.ts`](vitest.config.ts) — notably
`server.deps.inline: ["@behindthemusictree/app-kit"]` (app-kit ships un-prebundled ESM that needs
inlining under Vitest) and a coverage gate (`v8` provider, thresholds in the `coverage.thresholds`
block). Full strategy, mocking conventions, and directory rules: [docs/testing.md](docs/testing.md).
