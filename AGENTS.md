# AGENTS.md

Next.js (App Router) + React + TypeScript frontend for TheMusicTree, styled with
Tailwind. Talks to the grow-the-music-tree-api backend.

TheMusicTree is the system; BTMT (BehindTheMusicTree) is the team building it. It is
a genre tree first, to explore and listen to, and also aims to be a reference
classifying all music: the genre tree comes from Wikidata's music-genre taxonomy, and the
backend holds every MusicBrainz song (both prepared by `the-music-tree-pipelines`), including songs
without a genre or video, so users can later link genreless songs to a genre. A genre's
detail panel lists all its songs (primary-descendant subtree included), playable or
not; genre playlists and the tracklist hold only playable ones (`youtube_video_id` set and
no `youtube_unplayable_reason`).

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5 (`strict: true`)
- Tailwind CSS 3 (utility classes only — no CSS modules)
- Vitest + Testing Library (happy-dom) for tests
- pnpm as package manager
- Internal packages: `@behindthemusictree/app-kit`, `brand`, `ui`

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm typecheck` — `tsc --noEmit` over everything, test files included (`next build` skips them)
- `pnpm lint` — ESLint (flat config, `eslint.config.mjs`)
- `pnpm test` — Vitest run; `pnpm test:watch` / `pnpm test:coverage` for iterating
- Validation before calling anything done: `pnpm lint && pnpm typecheck && pnpm build && pnpm test`

## Structure

- `src/app/` — App Router pages (route group `(app)/`)
- `src/components/` — `ui/` (incl. `popup/`; local, unrelated to the `@behindthemusictree/ui` package), `features/`
- `src/api/domains/` — API client modules per domain
- `src/hooks/`, `src/lib/`, `src/models/`, `src/schemas/`, `src/types/`, `src/utils/`
- Tests are co-located next to source as `*.test.ts(x)` — no separate test dir
- `docs/` — canonical conventions and architecture docs (imported below)
- Path aliases (`@app/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@utils/*`, …) are
  configured in `tsconfig.json` — always use them, never deep relative imports

## Conventions (canonical sources — read these, this file only highlights traps)

Read `docs/STYLE_GUIDE.md` and `docs/testing.md` before relevant implementation or test changes.

Git workflow, PRs, releases, versioning: read `CONTRIBUTING.md`, `docs/VERSIONING.md`,
`docs/SEMVER_GUIDE.md` when doing branch/PR/release work.

## Critical rules agents get wrong here

- **Branching**: PRs to `develop` only from `feature/*`,
  `dependabot/*`, `release/*`, `hotfix/*`. PRs to `main` only from `release/*` or
  `hotfix/*`. **`chore/*` and `fix/*` are not strict Gitflow and CI rejects them** — bug fixes
  and CI/tooling/maintenance work go on `feature/*`. There is no `ci/*` prefix.
  Never commit directly to `main`/`develop`.
- **Never locally `git merge` + `git push origin main`** to ship a release/hotfix —
  it skips the PR/branch-protection checks. Always open a PR and merge on GitHub.
- **Versioning**: prepare `package.json` and `CHANGELOG.md` on `release/*` or
  `hotfix/*` without creating a tag. After the PR merges into `main`, the shared
  release workflow creates the matching immutable tag. See `docs/VERSIONING.md`.
- **Styling**: Tailwind utility classes only. No `.module.css` files, no inline
  styles. Class order: Layout → Typography → Visual → Interactive → States (see
  `docs/STYLE_GUIDE.md`).
- **Testing**: prefer `getByRole` > `getByLabelText` > `getByText` > `getByTestId`;
  never `document.querySelector`. Vitest unit/component tests run *without* React
  Strict Mode — don't wrap in `<StrictMode>`.
- **PR descriptions**: draft in `.pr-descriptions/<branch-name>.md` (git-ignored,
  never commit it) before pasting into the GitHub UI — see CONTRIBUTING.md §6.2.
- **Comments**: only when the *why* is non-obvious — no placeholder comments
  (`// changed`, `// fix`, `// temp`, etc.).
- **Env vars**: only `NEXT_PUBLIC_*`-prefixed vars are exposed to the browser.
  `@behindthemusictree/*` packages are public on npmjs; installing needs no token.
- **Dev backend**: `./scripts/dev-up.sh` targets read-only staging by default (rejects dev-client
  tokens, so no admin sign-in); `./scripts/dev-up.sh --local` starts the local grow-api
  (`http://127.0.0.1:8001`, from `../grow-the-music-tree-api`) instead. Plain `pnpm dev` still uses
  `.env`, which targets the local grow-api — check it with `curl 127.0.0.1:8001/health/`.
- **Admin sign-in locally**: use the dev Google client, and give the local grow-api the same
  `GOOGLE_OAUTH_CLIENT_ID` plus your `ADMIN_GOOGLE_SUB`. Open `http://localhost:<3000–3009>` (what `pnpm dev`
  prints), never `127.0.0.1`, or Google returns `redirect_uri_mismatch`. See
  `docs/frontend-auth.md` → Setup.
- **Dockerfile `runner` stage**: must keep `apk add curl` and `ENV HOSTNAME=0.0.0.0` —
  Coolify's post-deploy healthcheck runs `curl`/`wget` inside the container (alpine ships
  neither by default) against `localhost`, which is unreachable if `$HOSTNAME` is left at
  Docker's auto-set container-ID value. Removing either regresses a real production
  rollback incident (see `CHANGELOG.md` v2.4.0 "Fixed" and `ARCHITECTURE.md`).

## Further docs

- `docs/DEPLOYMENT.md`, `docs/frontend-auth.md`, `docs/DATA_ATTRIBUTES.md`, `docs/SEMANTIC_HTML.md`
- Ecosystem and ownership: consult the project documentation and the relevant package sources.

## Scoped project rules

Before working on `src/**/*.ts` or `src/**/*.tsx`, read `.agents/rules/api-responses.md`.
Before working on `src/**/*.tsx` or `src/**/*.css`, read `.agents/rules/spacing.md`.
Claude `paths:` metadata is not a Codex loader. Graphify can be used when installed and useful.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

`agentRules: false` in `next.config.ts` stops `next dev` from writing its own copy of this
section into `AGENTS.md`; keep it that way, or every Next upgrade that changes the
generated text leaves a dirty tree that blocks `git pull`.
