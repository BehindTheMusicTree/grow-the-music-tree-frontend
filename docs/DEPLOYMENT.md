# Vercel deployment (staging and production)

This guide covers deploying the app to Vercel with **develop → staging** and **main → production**. Branch flow matches [CONTRIBUTING.md](../CONTRIBUTING.md) and [.github/workflows/validate.yml](../.github/workflows/validate.yml).

## 1. Connect the repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New… → Project** and import your `grow-the-music-tree-frontend` repository.
3. Leave framework preset as **Next.js** and root directory as **./** (or `src` if your app lives there; this project uses root).
4. Deploy. The first deployment will use your default branch.

After this, configure production and staging as below: **production** builds from **`main`** when you push a **semver release tag** or run the deploy workflow manually; **develop** drives staging via Vercel Git.

## 2. Vercel project configuration

### 2.1 Production branch

1. Open the project on Vercel → **Settings**.
2. In the left sidebar, go to **Environments** (or **Git** → production branch, depending on UI).
3. Set **Production Branch** to `main`. Save.
4. Production deploys for `main` are triggered by the [**Vercel deploy**](../.github/workflows/vercel-deploy.yml) GitHub Action (deploy hook), not by Vercel’s Git integration (`vercel.json` disables Git-initiated production deploys for `main`). Pushing a **semver release tag** `vMAJOR.MINOR.PATCH` (or a manual **Vercel deploy** run) updates `NEXT_PUBLIC_APP_VERSION` and calls the hook so Vercel builds production. Merging to `main` alone does not run that workflow.

### 2.2 Production domain

1. **Settings → Domains**.
2. Click **Add** and enter your production domain (e.g. `app.themusictree.org` or `grow.themusictree.org`).
3. Leave it assigned to the production branch (`main`) or the default “Production” environment.
4. Add the DNS records Vercel shows at your DNS provider (A/CNAME, etc.).

### 2.3 Staging (develop branch)

Staging works on the **free (Hobby) plan**: use **Domains** to assign a custom URL to the `develop` branch. You do **not** need “Create Pre-production Environment” (that’s a Pro feature).

- **Preview URL only**: Every push to `develop` gets a preview URL (e.g. `grow-the-music-tree-frontend-git-develop-username.vercel.app`). No extra config.
- **Staging custom domain** (recommended):
  1. **Settings → Domains** (not “Environments” / “Pre-production Environment”).
  2. Click **Add** and enter your staging domain (e.g. `staging.grow.themusictree.org`).
  3. When adding the domain, set **Git Branch** to `develop`. Only deployments from `develop` will be served on this domain.
  4. Add the CNAME record (and any other DNS) Vercel shows at your DNS provider.

Result:

| Environment | Branch    | Deploys when       | URL example                    |
| ----------- | --------- | ------------------ | ------------------------------ |
| Production  | `main`    | Push tag `vX.Y.Z` or manual **Vercel deploy** | `app.themusictree.org`         |
| Staging     | `develop` | Push to develop    | `staging.grow.themusictree.org` or preview URL |
| PR previews | any       | Open PR            | `…-git-branch-…vercel.app`     |

## 3. Environment variables

For **local** runs (`npm run dev`): copy `env/development/example/.env.development.example` to `.env.local` (or use presets in `env/development/available/`) and set every variable listed there. The build fails if any required env var is missing (see `REQUIRED_ENV_VARS` in `next.config.js`).

On **Vercel** you can either set variables manually under **Settings → Environment Variables**, or sync them from GitHub using the workflow below.

### GitHub Packages (`@behindthemusictree/*`)

The repo root [`.npmrc`](../.npmrc) registers `@behindthemusictree` with `npm.pkg.github.com` and uses **`${NPM_TOKEN}`** during `npm install` / `npm ci`. **Vercel** must define **`NPM_TOKEN`** (sensitive) for **Production**, **Preview**, and **Development** if you use `vercel dev`. Use a GitHub PAT with **`read:packages`** (and access to the org that owns the package). It is install-only; Next.js does not read it at runtime.

**Local:** `export NPM_TOKEN=…` before `npm ci`, or use another credential flow you prefer. `npm` does not load `.env` for installs.

**Optional:** Repository secret **`GH_PACKAGES_TOKEN`** (same PAT). The [**Vercel sync env**](../.github/workflows/vercel-sync-env.yml) workflow passes it into the sync script so **`NPM_TOKEN`** is upserted on Vercel when the secret is set (skipped when empty).

### Organization assets (branding)

The banner **TheMusicTree** lockup and sidebar social icons use **`@behindthemusictree/assets`**. The lockup’s organization site URL is embedded when that package is published; **`NEXT_PUBLIC_THEMUSICTREE_URL`** is not used.

### 3.1 Syncing env vars from GitHub (recommended)

You can push environment variables to Vercel from GitHub Actions so they stay in sync with GitHub Secrets and Variables. There are **two** workflows:

| Workflow | File | When it runs | What it does |
| -------- | ---- | ------------ | ------------- |
| **Vercel sync env** | [`vercel-sync-env.yml`](../.github/workflows/vercel-sync-env.yml) | **Manual only** (**Actions → Vercel sync env → Run workflow**) | Upserts **all** mapped `NEXT_PUBLIC_*` variables to Vercel **production** and/or **preview** (you choose via checkboxes). **Does not** trigger deploy hooks. |
| **Vercel deploy** | [`vercel-deploy.yml`](../.github/workflows/vercel-deploy.yml) | Push semver tag **`v*.*.*`** (exactly `vMAJOR.MINOR.PATCH`), or manual **Actions → Vercel deploy** | Sets **only** `NEXT_PUBLIC_APP_VERSION` on Vercel production (tag must match `package.json` on tag pushes), then POSTs the **production** deploy hook. |

After you change GitHub **Variables** or **Secrets** that map to Vercel, run **Vercel sync env** so Vercel matches GitHub. Routine merges to `main` do **not** re-sync those values or deploy production.

**Staging (`develop` and PRs)** is built by **Vercel Git** only. Run **Vercel sync env** with “preview” enabled when preview/staging env vars in GitHub change, or set preview variables manually in Vercel. `NEXT_PUBLIC_APP_VERSION` is **not** updated on every `develop` push by CI.

**Required** GitHub Secrets (repo level):

- `VERCEL_TOKEN` – [Vercel token](https://vercel.com/account/tokens) with access to the project.
- `VERCEL_PROJECT_ID` – Project id or name (e.g. `grow-the-music-tree-frontend`).

**Optional** GitHub Secret (repo level):

- `GH_PACKAGES_TOKEN` – Same PAT as Vercel **`NPM_TOKEN`**; used by **Vercel sync env** to push **`NPM_TOKEN`** (sensitive) to Vercel when set.

**Required** GitHub Secret (environment **PROD** only, for **Vercel deploy**):

- `VERCEL_DEPLOY_HOOK` – URL of the Vercel deploy hook for **production** (`main`).

**How to get them**

- **VERCEL_TOKEN**: Go to [vercel.com/account/tokens](https://vercel.com/account/tokens), click **Create Token**, give it a name (e.g. “GitHub Actions env sync”), and optionally limit it to the project. Copy the token once (it is shown only once) and store it as a GitHub secret.
- **VERCEL_PROJECT_ID**: Open your project on Vercel → **Settings** → **General**. The **Project ID** is in the “Project ID” or “Project Name” field (you can use either the id or the project name). For a team project, use the project name/slug as shown in the project URL.

**GitHub Environments:** Create **PROD** and **STAGING** in **Settings → Environments** (names must match the workflows). **Vercel deploy** uses **PROD** (needs `VERCEL_DEPLOY_HOOK`). **Vercel sync env** uses **PROD** for the production sync job and **STAGING** for the preview sync job; neither job requires a deploy hook.

**Repo variables** (Settings → Secrets and variables → Actions → Variables):

| Variable                     | Used for |
| ---------------------------- | -------- |
| `CONTACT_EMAIL`              | `NEXT_PUBLIC_CONTACT_EMAIL` |
| `SPOTIFY_REDIRECT_RELATIVE_URI` | Path segment for `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` (e.g. `auth/spotify/callback`) |
| `SPOTIFY_SCOPES`             | `NEXT_PUBLIC_SPOTIFY_SCOPES` |
| `GOOGLE_REDIRECT_RELATIVE_URI` | Path segment for `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (e.g. `auth/google/callback`) |
| `TRACK_UPLOAD_TIMEOUT_MS`    | `NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS` |
| `DOMAIN_NAME`                | Base domain for all built URLs |
| `HTMT_API_SUBDOMAIN`    | API host label (without `staging.`): builds `NEXT_PUBLIC_BACKEND_BASE_URL` with prod = `https://<this>.<DOMAIN_NAME>/…`, preview = `https://staging.<this>.<DOMAIN_NAME>/…` |
| `HTMT_API_ROOT_SEGMENT`      | **Required.** Django `API_ROOT_BASE` path segment (no leading/trailing slashes), e.g. `v2`. Sync fails if unset. Example: `https://<api-host>/v2/` |
| `GTMT_FRONT_SUBDOMAIN`  | Builds app URL for redirect URIs: prod = `https://<this>.<DOMAIN_NAME>`, preview = `https://staging.<this>.<DOMAIN_NAME>` |
| `AUDIOMETA_SUBDOMAIN`   | Builds `NEXT_PUBLIC_AUDIOMETA_URL` as `https://<this>.<DOMAIN_NAME>` |
| `SPOTIFY_CLIENT_ID_PROD`     | `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` on production |
| `SPOTIFY_CLIENT_ID_STAGING`  | `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` on Vercel preview/staging (required when running **Vercel sync env** for preview) |
| `GOOGLE_CLIENT_ID_PROD`      | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on production |
| `GOOGLE_CLIENT_ID_STAGING`   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel preview/staging (required when running **Vercel sync env** for preview) |

**How full sync works (`vercel-sync-env.yml`):** Each job runs in a **GitHub Environment** (**PROD** or **STAGING**), so it sees the right secrets. It syncs only to the matching Vercel target.

| Source | → Vercel |
|--------|----------|
| Repo variables + **PROD** env secrets | Vercel **production** |
| Repo variables + **STAGING** env secrets | Vercel **preview** (staging and PR previews) |

The sync sets `NEXT_PUBLIC_SENTRY_IS_ACTIVE` to `true`, `NEXT_PUBLIC_SPOTIFY_AUTH_URL` to `https://accounts.spotify.com/authorize`, builds `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` / `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` from the app URL (prod = `https://<GTMT_FRONT_SUBDOMAIN>.<DOMAIN_NAME>`, preview = `https://staging.<GTMT_FRONT_SUBDOMAIN>.<DOMAIN_NAME>`) + relative path, and sets `NEXT_PUBLIC_APP_VERSION`: **production** = `package.json` `version` (manual workflow; no tag check); **preview** = `<version>-dev+<shortsha>`.

**New production setup:** Either configure all `NEXT_PUBLIC_*` in the Vercel UI or run **Vercel sync env** once for production before relying on **Vercel deploy** (which only updates `NEXT_PUBLIC_APP_VERSION` plus the hook).

**Vercel deploy** requires `VERCEL_DEPLOY_HOOK` in **PROD**; if it is missing, the job fails fast.

## 4. Troubleshooting: Vercel shows old version

If production or staging shows an old version after you merged to `main`, pushed a tag, or pushed to `develop`:

1. **Production branch** – Vercel → Project → **Settings → Git**. Ensure **Production Branch** is `main`. If it is `master` or something else, change it to `main` and save. Production updates when **Vercel deploy** runs (release tag or manual), not on every merge to `main`.
2. **Which URL you’re opening** – Confirm you’re on the right URL. Production domain goes to the latest `main` deployment; preview URLs are tied to a specific branch/commit. If you use a custom staging domain, check **Settings → Domains** and confirm which branch it’s assigned to.
3. **Builds failing** – In Vercel → **Deployments**, check the latest deployment for your branch. If it’s **Failed**, fix the build (e.g. env vars, Node version, `npm run build` locally). Only successful builds update the live site.
4. **Redeploy** – **Deployments** → open the latest deployment for `main` (or your branch) → **⋯** → **Redeploy** to force a fresh build from the same commit.
5. **Cache** – Try a hard refresh (e.g. Ctrl+Shift+R / Cmd+Shift+R) or an incognito window to rule out browser cache.
6. **Git connection** – **Settings → Git** should show the correct repository. If you renamed the repo or moved it, re-import the project or reconnect the Git integration.

## 5. Summary

- **Staging**: Push to `develop` (or open a PR) → Vercel builds **preview** deployments via **Git** (automatic).
- **Production**: **Vercel deploy** runs on push of semver tag **`vMAJOR.MINOR.PATCH`** (must match `package.json`) or on manual dispatch → sets `NEXT_PUBLIC_APP_VERSION` and triggers the **production deploy hook** (not Vercel’s Git deploy for `main`).
- **Domains**: **Settings → Domains**; assign production domain to production, staging domain to branch `develop`.
- **Full env sync**: After changing GitHub vars/secrets that map to Vercel, run **Actions → Vercel sync env**. Merge to `main` does not sync those values or deploy production.
- **Releases**: Use a semver tag on `main` to ship; optional manual **Vercel deploy** redeploys without a new tag. See [VERSIONING.md](VERSIONING.md).
- **Old version showing**: See [§4 Troubleshooting](#4-troubleshooting-vercel-shows-old-version).
