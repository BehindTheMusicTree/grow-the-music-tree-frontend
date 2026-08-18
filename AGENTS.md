# AGENTS.md

Next.js (App Router) + React + TypeScript frontend for Behind The Music Tree,
styled with Tailwind. Talks to the TheMusicTreeAPI backend.

## Stack

- Next.js 16 (App Router), React 19, TypeScript 5 (`strict: true`)
- Tailwind CSS 3 (utility classes only — no CSS modules)
- Vitest + Testing Library (happy-dom) for tests
- pnpm as package manager
- Internal packages: `@behindthemusictree/app-kit`, `brand`, `genre-tree-view`, `ui`

## Commands

- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build (also the closest thing to a typecheck)
- `pnpm lint` — ESLint (flat config, `eslint.config.mjs`)
- `pnpm test` — Vitest run; `pnpm test:watch` / `pnpm test:coverage` for iterating
- Validation before calling anything done: `pnpm lint && pnpm build && pnpm test`

## Structure

- `src/app/` — App Router pages (route group `(app)/`)
- `src/components/` — `ui/` (incl. `popup/`), `features/`, `auth/`
- `src/api/domains/` — API client modules per domain
- `src/hooks/`, `src/lib/`, `src/models/`, `src/schemas/`, `src/types/`, `src/utils/`
- Tests are co-located next to source as `*.test.ts(x)` — no separate test dir
- `docs/` — canonical conventions and architecture docs (imported below)
- Path aliases (`@app/*`, `@components/*`, `@hooks/*`, `@lib/*`, `@utils/*`, …) are
  configured in `tsconfig.json` — always use them, never deep relative imports

## Conventions (canonical sources — read these, this file only highlights traps)

@CONTRIBUTING.md
@docs/STYLE_GUIDE.md
@docs/testing.md
@docs/VERSIONING.md
@docs/SEMVER_GUIDE.md

## Critical rules agents get wrong here

- **Branching**: PRs to `develop` only from `feature/*`, `fix/*`, `chore/*`,
  `dependabot/*`, `release/*`, `hotfix/*`. PRs to `main` only from `release/*` or
  `hotfix/*`. There is **no `ci/*` prefix** — CI/tooling changes use `chore/*`.
  Never commit directly to `main`/`develop`.
- **Never locally `git merge` + `git push origin main`** to ship a release/hotfix —
  it skips the PR/branch-protection checks. Always open a PR; merge on GitHub; then
  `git pull` locally before tagging.
- **Versioning**: `npm version` (the one that creates the shipping `vX.Y.Z` tag) runs
  only on `main`, only after a `release/*`/`hotfix/*` PR has merged. On `release/*`
  branches, prepare the version with `npm pkg set version=X.Y.Z` (or
  `npm version … --no-git-tag-version`) — never the tagging form.
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
  Installing requires a GitHub PAT with `read:packages` for `@behindthemusictree/*`.

## Further docs

- Auth: `docs/backend-auth.md`, `docs/frontend-auth.md`
- `docs/DEPLOYMENT.md`, `docs/DATA_ATTRIBUTES.md`, `docs/SEMANTIC_HTML.md`
