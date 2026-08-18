# Coolify deployment (staging and production)

This guide covers deploying the app to **Coolify**, self-hosted on the BTMT VPS, with **`develop` → staging** and **`main` → production**. Branch flow matches [CONTRIBUTING.md](../CONTRIBUTING.md) and [.github/workflows/validate.yml](../.github/workflows/validate.yml).

Deployment itself is **not** driven by anything in this repo. It's owned by the `infrastructure` repo: an Ansible role (`ansible/roles/coolify`) configures a Coolify application named `gtmt-front` from `ansible/playbooks/group_vars/all.yml`'s `coolify_projects` list, applied via GitHub Actions. This repo only needs to provide a working `Dockerfile` and the build/runtime env vars Coolify expects.

## 1. How it deploys

Coolify's GitHub App integration watches this repo and builds directly from its Dockerfile — there is no deploy hook or CI step in this repo that triggers a deploy.

| Environment | Branch    | Deploys when                | URL                                          |
| ----------- | --------- | ---------------------------- | --------------------------------------------- |
| Production  | `main`    | Push to `main`               | `grow.themusictree.org` (production domain)    |
| Staging     | `develop` | Push to `develop`            | `grow-staging.themusictree.org`                |
| PR previews | any, targeting `develop` | Open/update PR | `{{pr_id}}.gtmt-front-staging.themusictree.org` |

Auto-deploy on push and PR previews are both configured on the Coolify application itself (`preview_deployments_enabled`), not by a workflow in this repo.

## 2. Build-time vs. runtime environment variables

This is the distinction that matters most when adding a new env var:

- **`NEXT_PUBLIC_*` vars** are inlined into the JS bundle by `next build`. They must be passed as **Docker build args** (`ARG`/`ENV` in the `builder` stage of the [`Dockerfile`](../Dockerfile)) — Coolify supplies these via its **`buildtime_env`** config. Setting one only as a runtime container env var has no effect; it won't be in the built bundle.
- **Server-only vars** (read via `process.env.X` inside a Route Handler or other server code, never referenced with the `NEXT_PUBLIC_` prefix) are read at **request time** by the running Next.js server. They must be **runtime container env vars** — Coolify supplies these via its **`static_env`** config. There's currently one such var: `GTMT_API_KEY` (see below).

`next.config.js`'s `REQUIRED_ENV_VARS` check runs at `next build` time and fails the build with "Missing required environment variable(s)" if any required `NEXT_PUBLIC_*` build arg is missing.

## 3. Grow-api write proxy (`GTMT_API_KEY`)

`grow-the-music-tree-api` requires an `X-API-Key` header on writes (genre/genre-playlist create, update, delete, load-example). `grow-the-music-tree-frontend` never sends that key from the browser — the Route Handler at `src/app/api/grow-proxy/reference/[...path]/route.ts` reads `process.env.GTMT_API_KEY` and attaches it server-side to reference-genre traffic before forwarding to grow-api (see `getGrowBackendBaseUrl` in [src/lib/site-urls.ts](../src/lib/site-urls.ts) and `getGrowApiUpstreamBaseUrl` in [src/lib/grow-api-upstream-url.ts](../src/lib/grow-api-upstream-url.ts)).

Because this is read at request time and is not `NEXT_PUBLIC_*`, it is wired as a **Coolify runtime env var** (`static_env`/`preview_static_env`), not a Docker build arg — it does not appear in the `Dockerfile` at all.

It's set from the `infrastructure` repo, not from anything in this repo, and there's no GitHub secret for it anywhere:

- `ansible/roles/coolify/tasks/generate_app_secrets.yml` generates the value once per environment (`openssl rand -hex 32`, persisted at `/data/coolify/secrets/gtmt-api-token-{prod,staging}.txt` on the VPS — idempotent, so it survives every subsequent provisioning run unchanged) and exposes it as the `coolify_gtmt_api_token_prod`/`coolify_gtmt_api_token_staging` Ansible facts.
- `ansible/playbooks/group_vars/all.yml` maps those same facts into **both** `gtmt-front`'s `static_env.{production,staging}.GTMT_API_KEY` (and `preview_static_env.staging.GTMT_API_KEY`) **and** `gtmt-api`'s `static_env.{production,staging}.GROW_API_KEY` — one generated value, two apps, set atomically in the same Ansible run, so they can never drift out of sync.
- `grow-the-music-tree-api`'s own `sync-env-to-coolify.yml` deliberately does **not** set `GROW_API_KEY` (same carve-out as `DATABASE_URL`) — Ansible is the sole owner.

This repo has no secret of its own for `GTMT_API_KEY` — it's entirely infra-side configuration. Local dev sets `GTMT_API_KEY` directly in `.env.local` if you need to exercise the write proxy against a live grow-api.

## 4. Organization assets (branding and subdomains)

The banner **TheMusicTree** lockup and sidebar social icons use **`@behindthemusictree/assets`**. The lockup's organization site URL is embedded when that package is published; `NEXT_PUBLIC_THEMUSICTREE_URL` is not used.

[`src/lib/site-urls.ts`](../src/lib/site-urls.ts) also imports the org's subdomain labels (`HTMT_API_SUBDOMAIN`, `AUDIOMETA_FRONT_SUBDOMAIN`) and `ORG_DOMAIN` from this package to compute `NEXT_PUBLIC_BACKEND_BASE_URL` and the AudioMeta link at build/runtime. Keep `@behindthemusictree/assets` reasonably current (`pnpm install` after a version bump) so these constants exist and stay accurate.

## 5. Build-time env vars reference

These are the `NEXT_PUBLIC_*` `ARG`s declared in the [`Dockerfile`](../Dockerfile)'s `builder` stage. Coolify supplies them via `buildtime_env` (configured in `infrastructure`'s `ansible/playbooks/group_vars/all.yml`, in the `gtmt-front` project's `coolify_projects` entry):

| Variable                                | Notes |
| ---------------------------------------- | ----- |
| `NEXT_PUBLIC_CONTACT_EMAIL`              | |
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`          | Per-environment (prod/staging) |
| `NEXT_PUBLIC_SPOTIFY_SCOPES`             | |
| `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`       | Relative path (e.g. `/auth/spotify/callback`), resolved against the page's own origin at runtime |
| `NEXT_PUBLIC_SPOTIFY_AUTH_URL`           | `https://accounts.spotify.com/authorize` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`           | Per-environment (prod/staging) |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`        | Relative path (e.g. `/auth/google/callback`) |
| `NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS`    | |
| `NEXT_PUBLIC_BACKEND_BASE_URL`           | |
| `NEXT_PUBLIC_SENTRY_IS_ACTIVE`           | |

Values, per-environment overrides, and how they're sourced (GitHub vars/secrets) live entirely in the `infrastructure` repo, not here.

## 6. Local build against the Dockerfile

To reproduce a Coolify build locally:

```bash
DOCKER_BUILDKIT=1 docker build \
  --secret id=GH_PACKAGES_TOKEN_READ,src=<path-to-token-file> \
  --build-arg NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000/v2/ \
  --build-arg NEXT_PUBLIC_CONTACT_EMAIL=you@example.com \
  --build-arg NEXT_PUBLIC_SPOTIFY_CLIENT_ID=... \
  --build-arg NEXT_PUBLIC_SPOTIFY_SCOPES=... \
  --build-arg NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=/auth/spotify/callback \
  --build-arg NEXT_PUBLIC_SPOTIFY_AUTH_URL=https://accounts.spotify.com/authorize \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=... \
  --build-arg NEXT_PUBLIC_GOOGLE_REDIRECT_URI=/auth/google/callback \
  --build-arg NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS=300000 \
  --build-arg NEXT_PUBLIC_SENTRY_IS_ACTIVE=false \
  -t grow-the-music-tree-frontend .

docker run -p 3000:3000 -e PORT=3000 -e GTMT_API_KEY=... grow-the-music-tree-frontend
```

The `GH_PACKAGES_TOKEN_READ` build secret is required — it's a GitHub PAT with `read:packages`, used by `pnpm install` inside the `builder` stage to pull `@behindthemusictree/*` from GitHub Packages. See [GitHub Packages tokens](https://github.com/BehindTheMusicTree/infrastructure/blob/main/docs/guides/github-packages-tokens.md) in the `infrastructure` repo for how it's provisioned as a Coolify build-only secret.

## 7. Summary

- **Staging**: Push to `develop` (or open a PR against `develop`) → Coolify builds automatically from the Dockerfile.
- **Production**: Push to `main` → Coolify builds automatically. There is no release-tag gate or manual deploy step in this repo; `main` is always deployable.
- **Build-time vs. runtime**: `NEXT_PUBLIC_*` vars are Docker build args (Coolify `buildtime_env`); `GTMT_API_KEY` is a runtime container env var (Coolify `static_env`) — see [§2](#2-build-time-vs-runtime-environment-variables).
- **All Coolify config** (which vars, which values, secrets sourcing) lives in the `infrastructure` repo's `ansible/playbooks/group_vars/all.yml`, not in this repo.
- **Releases**: `package.json` `version` / `CHANGELOG.md` versioning still follows Git Flow (see [VERSIONING.md](VERSIONING.md)) for traceability, but no deploy is gated on a version tag — tagging and deploying are independent.
