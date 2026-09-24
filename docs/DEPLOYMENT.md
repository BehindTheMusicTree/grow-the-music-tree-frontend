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
- **Server-only vars** (read via `process.env.X` inside a Route Handler or other server code, never referenced with the `NEXT_PUBLIC_` prefix) are read at **request time** by the running Next.js server. They must be **runtime container env vars** — Coolify supplies these via its **`static_env`** config. These are the Auth.js admin sign-in vars `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST` (see [frontend-auth.md](frontend-auth.md)).

Both sets are declared in Zod schemas: build-time vars in [`src/lib/env.ts`](../src/lib/env.ts) (validated when `next.config.ts` loads, so `next build` fails with "Invalid public environment variables"), runtime vars in [`src/lib/env.server.ts`](../src/lib/env.server.ts) (validated at server boot by `src/instrumentation.ts`, so the container fails its healthcheck with "Invalid server environment variables"). `NEXT_PUBLIC_GTMT_API_ROOT_SEGMENT` is only read by the server proxy, so it is a runtime var despite its prefix.

## 3. Organization assets (branding and subdomains)

The banner **TheMusicTree** lockup and sidebar social icons use **`@behindthemusictree/assets`**. The lockup's organization site URL is embedded when that package is published; `NEXT_PUBLIC_THEMUSICTREE_URL` is not used.

[`src/lib/site-urls.ts`](../src/lib/site-urls.ts) also imports the org's subdomain labels (`HTMT_API_SUBDOMAIN`, `AUDIOMETA_FRONT_SUBDOMAIN`) and `ORG_DOMAIN` from this package to compute `NEXT_PUBLIC_BACKEND_BASE_URL` and the AudioMeta link at build/runtime. Keep `@behindthemusictree/assets` reasonably current (`pnpm install` after a version bump) so these constants exist and stay accurate.

## 4. Build-time env vars reference

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
| `NEXT_PUBLIC_BACKEND_BASE_URL`           | |
| `NEXT_PUBLIC_SENTRY_IS_ACTIVE`           | |

Values, per-environment overrides, and how they're sourced (GitHub vars/secrets) live entirely in the `infrastructure` repo, not here.

## 5. Local build against the Dockerfile

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
  --build-arg NEXT_PUBLIC_SENTRY_IS_ACTIVE=false \
  -t grow-the-music-tree-frontend .

docker run -p 3000:3000 -e PORT=3000 grow-the-music-tree-frontend
```

The `GH_PACKAGES_TOKEN_READ` build secret is required — it's a GitHub PAT with `read:packages`, used by `pnpm install` inside the `builder` stage to pull `@behindthemusictree/*` from GitHub Packages. See [GitHub Packages tokens](https://github.com/BehindTheMusicTree/infrastructure/blob/main/docs/guides/github-packages-tokens.md) in the `infrastructure` repo for how it's provisioned as a Coolify build-only secret.

## 6. Summary

- **Staging**: Push to `develop` (or open a PR against `develop`) → Coolify builds automatically from the Dockerfile.
- **Production**: Push to `main` → Coolify builds automatically. There is no release-tag gate or manual deploy step in this repo; `main` is always deployable.
- **Build-time vs. runtime**: `NEXT_PUBLIC_*` vars are Docker build args (Coolify `buildtime_env`); server-only vars are runtime container env vars (Coolify `static_env`) — see [§2](#2-build-time-vs-runtime-environment-variables).
- **All Coolify config** (which vars, which values, secrets sourcing) lives in the `infrastructure` repo's `ansible/playbooks/group_vars/all.yml`, not in this repo.
- **Releases**: `package.json` `version` / `CHANGELOG.md` versioning still follows Git Flow (see [VERSIONING.md](VERSIONING.md)) for traceability, but no deploy is gated on a version tag — tagging and deploying are independent.
