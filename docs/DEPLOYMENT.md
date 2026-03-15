# Vercel deployment (staging and production)

This guide covers deploying the app to Vercel with **develop → staging** and **main → production**. Branch flow matches [CONTRIBUTING.md](../CONTRIBUTING.md) and [.github/workflows/validate.yml](../.github/workflows/validate.yml).

## 1. Connect the repo to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (e.g. with GitHub).
2. **Add New… → Project** and import your `grow-the-music-tree-frontend` repository.
3. Leave framework preset as **Next.js** and root directory as **./** (or `src` if your app lives there; this project uses root).
4. Deploy. The first deployment will use your default branch.

After this, configure production and staging as below so that **main** deploys to production and **develop** to staging.

## 2. Vercel project configuration

### 2.1 Production branch

1. Open the project on Vercel → **Settings**.
2. In the left sidebar, go to **Environments** (or **Git** → production branch, depending on UI).
3. Set **Production Branch** to `main`. Save.
4. Every push (or merge) to `main` will trigger a **Production** deployment and update your production domain.

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
| Production  | `main`    | Push/merge to main | `app.themusictree.org`         |
| Staging     | `develop` | Push to develop    | `staging.grow.themusictree.org` or preview URL |
| PR previews | any       | Open PR            | `…-git-branch-…vercel.app`     |

## 3. Environment variables

For **local** runs (`npm run dev`): copy `env/development/example/.env.development.example` to `.env.local` (or use presets in `env/development/available/`) and set every variable listed there. The build fails if any required env var is missing (see `REQUIRED_ENV_VARS` in `next.config.js`).

On **Vercel** you can either set variables manually under **Settings → Environment Variables**, or sync them from GitHub using the workflow below.

### 3.1 Syncing env vars from GitHub (recommended)

You can push environment variables to Vercel from GitHub Actions so they stay in sync with GitHub Secrets and Variables.

Use the workflow [`.github/workflows/sync-vercel-env.yml`](../.github/workflows/sync-vercel-env.yml). It runs manually (**Actions → Sync Vercel env → Run workflow**) and syncs variables from GitHub to Vercel using the [Vercel REST API](https://vercel.com/docs/rest-api/reference/endpoints/projects/create-one-or-more-environment-variables).

**Required** GitHub Secrets (repo level):

- `VERCEL_TOKEN` – [Vercel token](https://vercel.com/account/tokens) with access to the project.
- `VERCEL_PROJECT_ID` – Project id or name (e.g. `grow-the-music-tree-frontend`).

**How to get them**

- **VERCEL_TOKEN**: Go to [vercel.com/account/tokens](https://vercel.com/account/tokens), click **Create Token**, give it a name (e.g. “GitHub Actions env sync”), and optionally limit it to the project. Copy the token once (it is shown only once) and store it as a GitHub secret.
- **VERCEL_PROJECT_ID**: Open your project on Vercel → **Settings** → **General**. The **Project ID** is in the “Project ID” or “Project Name” field (you can use either the id or the project name). For a team project, use the project name/slug as shown in the project URL.

**GitHub Environments:** Create two environments, **production** and **staging**, in **Settings → Environments**. Each sync job runs in one of these environments so per-environment variables (e.g. `APP_URL`) can differ. `NEXT_PUBLIC_BACKEND_BASE_URL` is built from repo vars: production = `https://<HTMT_API_SUBDOMAIN_NAME>.<DOMAIN_NAME>/`, preview = `https://<HTMT_API_SUBDOMAIN_NAME>-test.<DOMAIN_NAME>/`.

**Repo variables** (Settings → Secrets and variables → Actions → Variables):

| Variable                     | Used for |
| ---------------------------- | -------- |
| `CONTACT_EMAIL`              | `NEXT_PUBLIC_CONTACT_EMAIL` |
| `SPOTIFY_REDIRECT_RELATIVE_URI` | Path segment for `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` (e.g. `auth/spotify/callback`) |
| `SPOTIFY_SCOPES`             | `NEXT_PUBLIC_SPOTIFY_SCOPES` |
| `GOOGLE_REDIRECT_RELATIVE_URI` | Path segment for `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (e.g. `auth/google/callback`) |
| `TRACK_UPLOAD_TIMEOUT_MS`    | `NEXT_PUBLIC_TRACK_UPLOAD_TIMEOUT_MS` |
| `DOMAIN_NAME`                | Builds `NEXT_PUBLIC_BACKEND_BASE_URL` and `NEXT_PUBLIC_AUDIOMETA_URL` with subdomain vars |
| `HTMT_API_SUBDOMAIN_NAME`    | Builds `NEXT_PUBLIC_BACKEND_BASE_URL`: prod = `https://<this>.<DOMAIN_NAME>/`, preview = `https://<this>-test.<DOMAIN_NAME>/` |
| `AUDIOMETA_SUBDOMAIN_NAME`   | Builds `NEXT_PUBLIC_AUDIOMETA_URL` as `https://<this>.<DOMAIN_NAME>` |
| `SPOTIFY_CLIENT_ID_PROD`     | `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` on production |
| `SPOTIFY_CLIENT_ID_TEST`     | `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` on preview/staging |
| `GOOGLE_CLIENT_ID_PROD`      | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on production |
| `GOOGLE_CLIENT_ID_TEST`      | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on preview/staging |

**Environment variables** (Settings → Environments → **production** / **staging** → Environment variables):

| Variable   | Production env | Staging env |
| ---------- | -------------- | ----------- |
| `APP_URL`  | Production app URL (e.g. `https://app.themusictree.org`) | Staging app URL (e.g. `https://staging.grow.themusictree.org`) |

**How the sync works:** The workflow has two jobs. Each job runs in a **GitHub Environment** (production or staging), so it sees that environment’s variables. It syncs only to the matching Vercel target.

| Source | → Vercel |
|--------|----------|
| Repo variables + production env vars | Vercel **production** (`NEXT_PUBLIC_*` set for production) |
| Repo variables + staging env vars    | Vercel **preview** (staging and PR previews) |

The workflow also sets `NEXT_PUBLIC_SENTRY_IS_ACTIVE` to `true`, sets `NEXT_PUBLIC_SPOTIFY_AUTH_URL` to `https://accounts.spotify.com/authorize`, and builds `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` / `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` from `APP_URL` + relative path.

After the sync runs, trigger a redeploy in Vercel if you want the new values on the next build.

## 4. Troubleshooting: Vercel shows old version

If production or staging shows an old version after you pushed to `main` or `develop`:

1. **Production branch** – Vercel → Project → **Settings → Git**. Ensure **Production Branch** is `main`. If it is `master` or something else, change it to `main` and save; the next push to `main` will deploy to production.
2. **Which URL you’re opening** – Confirm you’re on the right URL. Production domain goes to the latest `main` deployment; preview URLs are tied to a specific branch/commit. If you use a custom staging domain, check **Settings → Domains** and confirm which branch it’s assigned to.
3. **Builds failing** – In Vercel → **Deployments**, check the latest deployment for your branch. If it’s **Failed**, fix the build (e.g. env vars, Node version, `npm run build` locally). Only successful builds update the live site.
4. **Redeploy** – **Deployments** → open the latest deployment for `main` (or your branch) → **⋯** → **Redeploy** to force a fresh build from the same commit.
5. **Cache** – Try a hard refresh (e.g. Ctrl+Shift+R / Cmd+Shift+R) or an incognito window to rule out browser cache.
6. **Git connection** – **Settings → Git** should show the correct repository. If you renamed the repo or moved it, re-import the project or reconnect the Git integration.

## 5. Summary

- **Deploy**: Push to `develop` → staging; push/merge to `main` → production. Vercel builds and deploys automatically via Git.
- **Domains**: **Settings → Domains**; assign production domain to production, staging domain to branch `develop`.
- **Env vars**: Set in Vercel UI or run **Actions → Sync Vercel env** after configuring repo variables and production/staging environment variables in GitHub.
- **Releases**: Tagging (e.g. `v0.2.0`) is independent; see [VERSIONING.md](VERSIONING.md). Vercel does not deploy on tag push; it deploys on branch push.
- **Old version showing**: See [§4 Troubleshooting](#4-troubleshooting-vercel-shows-old-version).
