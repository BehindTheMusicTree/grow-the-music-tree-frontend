# Coolify deployment (staging and production)

This guide covers deploying the app to **Coolify**, self-hosted on the BTMT VPS, with **`develop` → staging** and **`main` → production**. Branch flow matches [CONTRIBUTING.md](../CONTRIBUTING.md) and [.github/workflows/validate.yml](../.github/workflows/validate.yml).

This repo's [`build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml) builds the image and triggers the deploy. The Coolify application itself (`gtmt-front`, runtime env, domains) is owned by the `infrastructure` repo: an Ansible role (`ansible/roles/coolify`) configures it from `ansible/playbooks/group_vars/all.yml`'s `coolify_projects` list.

## 1. How it deploys

On push to `develop` or `main`, [`build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml) builds the Dockerfile on a GitHub-hosted runner, pushes it to GHCR (`ghcr.io/behindthemusictree/gtmt-front`, tag `staging` or `prod`, plus `sha-<short>`), then asks Coolify to redeploy that tag. `NEXT_PUBLIC_*` values differ per environment, so each branch builds its own image. Re-run a failed deploy with **Run workflow** (`workflow_dispatch`).

| Environment | Branch    | Deploys when                | URL                                          |
| ----------- | --------- | ---------------------------- | --------------------------------------------- |
| Production  | `main`    | Push to `main`               | `grow.themusictree.org` (production domain)    |
| Staging     | `develop` | Push to `develop`            | `grow-staging.themusictree.org`                |

## 2. Build-time vs. runtime environment variables

This is the distinction that matters most when adding a new env var:

- **`NEXT_PUBLIC_*` vars** are inlined into the JS bundle by `next build`. They must be passed as **Docker build args** (`ARG`/`ENV` in the `builder` stage of the [`Dockerfile`](../Dockerfile)) — [`build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml) supplies these via `build-args`. Setting one only as a runtime container env var has no effect; it won't be in the built bundle.
- **Server-only vars** (read via `process.env.X` inside a Route Handler or other server code, never referenced with the `NEXT_PUBLIC_` prefix) are read at **request time** by the running Next.js server. They must be **runtime container env vars** — Coolify supplies these via its **`static_env`** config. These are the Auth.js admin sign-in vars `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST` (see [frontend-auth.md](frontend-auth.md)), and `GROW_API_ORIGIN`, the grow-api origin without a path (the `v1` contract version is a constant in [`src/lib/grow-api-upstream-url.ts`](../src/lib/grow-api-upstream-url.ts)).

Both sets are declared in Zod schemas: build-time vars in [`src/lib/env.ts`](../src/lib/env.ts) (validated when `next.config.ts` loads, so `next build` fails with "Invalid public environment variables"), runtime vars in [`src/lib/env.server.ts`](../src/lib/env.server.ts) (validated at server boot by `src/instrumentation.ts`, so the container fails its healthcheck with "Invalid server environment variables").

## 3. Organization assets (branding and subdomains)

The banner **TheMusicTree** lockup and sidebar social icons use **`@behindthemusictree/assets`**. The lockup's organization site URL is embedded when that package is published; `NEXT_PUBLIC_THEMUSICTREE_URL` is not used.

[`src/lib/site-urls.ts`](../src/lib/site-urls.ts) also imports the org's subdomain labels (`HTMT_API_SUBDOMAIN`, `AUDIOMETA_FRONT_SUBDOMAIN`) and `ORG_DOMAIN` from this package to compute `NEXT_PUBLIC_BACKEND_BASE_URL` and the AudioMeta link at build/runtime. Keep `@behindthemusictree/assets` reasonably current (`pnpm install` after a version bump) so these constants exist and stay accurate.

## 4. Build-time env vars reference

These are the `NEXT_PUBLIC_*` `ARG`s declared in the [`Dockerfile`](../Dockerfile)'s `builder` stage. [`build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml) passes them as build args, from org-level GitHub variables:

| Variable                       | Notes |
| ------------------------------ | ----- |
| `NEXT_PUBLIC_CONTACT_EMAIL`    | `CONTACT_EMAIL` |
| `NEXT_PUBLIC_AUDIOMETA_URL`    | `https://<AUDIOMETA_FRONT_SUBDOMAIN>[-staging].<DOMAIN_NAME>` (`-staging` on `develop`) |
| `NEXT_PUBLIC_SENTRY_IS_ACTIVE` | `true` |

## 5. Local build against the Dockerfile

To reproduce a Coolify build locally:

```bash
DOCKER_BUILDKIT=1 docker build \
  --secret id=GH_PACKAGES_TOKEN_READ,src=<path-to-token-file> \
  --build-arg NEXT_PUBLIC_CONTACT_EMAIL=you@example.com \
  --build-arg NEXT_PUBLIC_AUDIOMETA_URL=https://audiometa-staging.themusictree.org \
  --build-arg NEXT_PUBLIC_SENTRY_IS_ACTIVE=false \
  -t grow-the-music-tree-frontend .

docker run -p 3000:3000 -e PORT=3000 grow-the-music-tree-frontend
```

The `GH_PACKAGES_TOKEN_READ` build secret is required — it's a GitHub PAT with `read:packages`, used by `pnpm install` inside the `builder` stage to pull `@behindthemusictree/*` from GitHub Packages. See [GitHub Packages tokens](https://github.com/BehindTheMusicTree/infrastructure/blob/main/docs/guides/github-packages-tokens.md) in the `infrastructure` repo for how it's provisioned; CI passes the org secret of the same name.

## 6. Summary

- **Staging**: Push to `develop` → GitHub Actions builds the `staging` image, Coolify deploys it.
- **Production**: Push to `main` → GitHub Actions builds the `prod` image, Coolify deploys it. There is no release-tag gate or manual deploy step in this repo; `main` is always deployable.
- **Build-time vs. runtime**: `NEXT_PUBLIC_*` vars are Docker build args (`build-and-deploy.yml`); server-only vars are runtime container env vars (Coolify `static_env`) — see [§2](#2-build-time-vs-runtime-environment-variables).
- **All Coolify app config** (runtime vars, domains, secrets sourcing) lives in the `infrastructure` repo's `ansible/playbooks/group_vars/all.yml`, not in this repo.
- **Releases**: `package.json` `version` / `CHANGELOG.md` versioning still follows Git Flow (see [VERSIONING.md](VERSIONING.md)) for traceability, but no deploy is gated on a version tag — tagging and deploying are independent.
