# GrowTheMusicTree Frontend

A community-driven platform for exploring and understanding musical genres through an interactive, evolving genre tree map.

This project is built with Next.js and served by the Next.js Node server in production (e.g. in Docker). The reverse proxy (e.g. Nginx, Traefik) should route traffic to the container’s app port.

## Ecosystem

Built inside the **[BehindTheMusicTree](https://github.com/BehindTheMusicTree)** ecosystem.

Want the big picture? Explore the full project universe on **[themusictree.org](https://themusictree.org)**, and see where this app fits on **[GrowTheMusicTree](https://themusictree.org/projects/grow-the-music-tree)**.

The portfolio website content lives in **[the-music-tree-frontend](https://github.com/BehindTheMusicTree/the-music-tree-frontend)**; this README focuses on building, testing, deploying, and contributing to this app.

## Table of Contents

- [Ecosystem](#ecosystem)
- [Overview](#overview)
- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Rendering Strategy](#rendering-strategy)
- [Auth callbacks](#auth-callbacks)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Docker](#docker)
- [CI](#ci)
- [Build & Hosting](#build--hosting)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)
- [License](#license)

## Overview

**What the application does:**  
GrowTheMusicTree is a web platform that allows users to explore and understand musical genres through an interactive, community-driven genre tree map. Users can visualize relationships between genres, connect their Spotify accounts to analyze their listening habits, and participate in genre classifications.

**Target users:**  
Music enthusiasts, researchers, and the general public interested in understanding music taxonomy and discovering new genres.

**High-level features:**

- Interactive genre tree visualization using D3.js
- Spotify OAuth integration for music library analysis
- Rich contextual information for each genre (historical, cultural, technical)

**Planned / not yet implemented** (see [VISION.md](VISION.md) and [TODO.md](TODO.md)):

- AI-powered genre detection for tracks
- Smart playlist generation based on musical journeys
- Community discussions and voting on genre classifications

## Pages

- Home (`/`)
- About (`/about`)
- Account (`/account`)
- Google Auth Callback (`/auth/google/callback`)
- Spotify Auth Callback (`/auth/spotify/callback`)
- Genre Playlists (`/genre-playlists`)
- MyMusicTree (`/me-genre-tree`)
- Reference tree (`/reference-genre-tree`, also the logo / home link)
- Spotify Library (`/spotify-library`)
- My Library (`/me-uploaded-library`)

See `docs/pages/` for detailed page documentation.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Rendering:** Next.js (Node server in production)
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **CI:** GitHub Actions
- **Containerization:** Docker (build and serve with Node)
- **Additional libraries:** React 19, D3.js, TanStack Query, React Howler, Sentry

## Rendering Strategy

The app is built with Next.js and served by the Node runtime in production:

- `next build` produces the `.next/` output
- The container runs `next start` and serves the app on `APP_PORT`
- The reverse proxy (Nginx, Traefik, etc.) must proxy to the container’s port rather than to a static file root

## Auth callbacks

Google and Spotify OAuth redirect the user to `/auth/google/callback` or `/auth/spotify/callback`. The **layout-level** component `AuthCallbackHandler` (`src/components/auth/AuthCallbackHandler.tsx`) runs in the app shell on every load, reads `window.location` to detect these paths, exchanges the `code` with the backend, shows "Connecting…" or an error popup, then redirects. With the Next.js server, the callback route is served and mounted normally.

## Project Structure

```
.
├── src/
│   ├── app/                # Next.js App Router pages (route groups, layouts, auth callbacks)
│   ├── api/                # API client domains (per-resource request/response handling)
│   ├── assets/             # Bundled images and static assets imported by components
│   ├── components/         # React components
│   │   ├── auth/          # Auth callback handling, guards
│   │   ├── features/      # Feature-specific components
│   │   └── ui/            # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and helpers (e.g. site-urls.ts)
│   ├── models/              # Data models and types
│   ├── schemas/             # API and domain schemas
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/                # Static assets served as-is
├── env/                   # Environment configuration (dev presets, examples)
├── scripts/               # Build, release, and env setup scripts
├── docs/                  # Architecture, auth, testing, and per-page documentation
├── .github/workflows/     # CI/CD workflows
├── Dockerfile             # Docker build configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── vitest.config.ts       # Testing configuration
└── README.md
```

## Environment Variables

Environment variables are resolved at build time.

Create a local environment file:

```bash
cp env/development/example/.env.development.example .env.local
```

**Example variables:**

```
NODE_ENV=development
PORT=9005

APP_VERSION=dev

NEXT_PUBLIC_APP_VERSION=dev
NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000/v2/
NEXT_PUBLIC_SENTRY_IS_ACTIVE=false

NEXT_PUBLIC_SPOTIFY_AUTH_URL=https://accounts.spotify.com/authorize
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=/auth/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-email playlist-read-private playlist-read-collaborative user-library-read user-top-read

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=/auth/google/callback
```

In the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → your app → **Settings** → **Redirect URIs**, add the **full** callback URL(s), e.g. `http://localhost:3000/auth/spotify/callback` for local dev and your production URL for deploy. The app builds the redirect URI from your origin when you use a path like `/auth/spotify/callback`.

For Google sign-in, in [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials, create an OAuth 2.0 Client ID (Web application) and add the **full** redirect URI(s) under "Authorized redirect URIs", e.g. `http://localhost:3000/auth/google/callback`.

**Notes:**

- Only variables prefixed with `NEXT_PUBLIC_` are available in the browser
- The sidebar "Audio Metadata" link and the backend host are computed from `@behindthemusictree/assets` (see [src/lib/site-urls.ts](src/lib/site-urls.ts)), not from env vars. `NEXT_PUBLIC_BACKEND_BASE_URL` remains available as a manual override (e.g. against `localhost:8000`); `NEXT_PUBLIC_HTMT_API_ROOT_SEGMENT` is required when it's unset.
- Changing env values requires a new build (restart `npm run dev` after env changes)
- Do not commit `.env.local`
- **Preset configs**: Put `.env.development.api-local` and `.env.development.api-remote` in `env/development/available/` (see `env/development/example/.env.development.api-*.example`). Then run `./scripts/setup-env-dev.sh local` or `./scripts/setup-env-dev.sh remote` to copy one to `.env.development.local`; Next.js only loads env files from the project root. Contents of `env/development/available/` are gitignored.

## Getting Started

### Prerequisites

- Node.js 20 (see [`.nvmrc`](.nvmrc))
- pnpm (`corepack enable && corepack prepare pnpm@10.33.2 --activate`, matching the Dockerfile and CI)
- A [GitHub PAT](https://github.com/settings/tokens) with `read:packages` (and org access) — [`.npmrc`](.npmrc) pulls `@behindthemusictree/*` packages from GitHub Packages
- Docker (optional, for containerized builds)

### Install dependencies

```bash
export NPM_TOKEN=ghp_…   # or set _authToken in ~/.npmrc instead
pnpm install --frozen-lockfile
```

## Scripts

| Command                 | Description                      |
| ----------------------- | -------------------------------- |
| `npm run dev`           | Start local development server   |
| `npm run build`         | Build for production             |
| `npm run start`         | Start production server (Node)   |
| `npm run lint`          | Run ESLint                       |
| `npm run verify-env`    | Verify environment configuration |
| `npm run test`          | Run unit tests                   |
| `npm run test:watch`    | Run tests in watch mode          |
| `npm run test:ui`       | Run tests with UI                |
| `npm run test:coverage` | Run tests with coverage          |

## Docker

Production and staging hosting run on **Coolify** as a multi-stage Docker build (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)). The Dockerfile builds the app in a `builder` stage (`pnpm build` against Next.js `output: "standalone"`) and copies only the standalone output into a slim `runner` stage that runs `node server.js`.

**Build image** (requires the `GH_PACKAGES_TOKEN_READ` build secret to install `@behindthemusictree/*`):

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
```

Every `NEXT_PUBLIC_*` var is required at build time (baked in by `next build`); the build fails fast if one is missing (see `REQUIRED_ENV_VARS` in `next.config.js`).

**Run container:**

```bash
docker run -p 3000:3000 -e PORT=3000 -e GTMT_API_KEY=... grow-the-music-tree-frontend
```

`GTMT_API_KEY` is server-only and read at request time (not `NEXT_PUBLIC_*`), so it's a runtime env var, not a build arg — see [§ Grow-api write proxy](docs/DEPLOYMENT.md#grow-api-write-proxy-gtmt_api_key) in DEPLOYMENT.md.

## CI

Continuous Integration ([`.github/workflows/validate.yml`](.github/workflows/validate.yml)) runs on each push to `main`/`develop` and on pull requests targeting them.

The CI pipeline includes:

- Dependency installation (`pnpm install --frozen-lockfile`, needs the `GH_PACKAGES_TOKEN_READ` repo secret)
- Linting
- Testing
- Build check

Deployment is handled entirely by **Coolify**, driven by the `infrastructure` repo's Ansible config and GitHub Actions — not by anything in this repo's own CI. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Build & Hosting

### Build and serve

```bash
npm run build
npm run start
```

Build output: `.next/`. The app is served by the Next.js Node server (`output: "standalone"` in production, via the Dockerfile's `runner` stage).

**Deployment:** The app is deployed to **Coolify** on push to `main` (production) or `develop` (staging), plus PR preview deployments off `develop`-targeted PRs. See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the full Coolify setup, including which env vars are build-time vs. runtime. Outside Coolify, the same Dockerfile can be built and run standalone (see [Docker](#docker) above); the reverse proxy (Nginx, Traefik, etc.) should proxy to the container's `PORT`.

## Troubleshooting

- **Auth callback shows no "Connecting with Google/Spotify...", no network request:** Callbacks are handled by `AuthCallbackHandler` in the app shell (see [Auth callbacks](#auth-callbacks)). With the Next.js server, the callback URL is served by the app; ensure the reverse proxy forwards `/auth/.../callback` to the container. If the backend exchange never runs: (1) **Cache** — Do a hard refresh (Ctrl+Shift+R / Cmd+Shift+R) or open the callback URL in an incognito window. (2) Check the browser console for errors.

- **Environment variables not applied:** Rebuild required after env changes
- **Clear local cache:**
  ```bash
  rm -rf .next node_modules
  npm install --legacy-peer-deps
  ```
- **Ensure Node.js version compatibility:** Requires Node.js >= 18
- **Peer dependency issues:** Use `--legacy-peer-deps` flag

## Documentation

For additional information about this project, please refer to:

- **[VISION.md](VISION.md)** - Project vision and goals
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and development setup
- **[CHANGELOG.md](CHANGELOG.md)** - Detailed history of changes
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community code of conduct
- **[TODO.md](TODO.md)** - Current development tasks and roadmap
- **[docs/VERSIONING.md](docs/VERSIONING.md)** - Versioning strategy and guidelines
- **[docs/SEMVER_GUIDE.md](docs/SEMVER_GUIDE.md)** - SemVer conventions used for releases
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Coolify staging and production deployment setup
- **[docs/REVERSE_PROXY_CONFIG.md](docs/REVERSE_PROXY_CONFIG.md)** - Nginx/reverse-proxy configuration for deployment
- **[docs/testing.md](docs/testing.md)** - Testing strategy, tools, and conventions
- **[docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)** - Code and UI styling conventions
- **[docs/SEMANTIC_HTML.md](docs/SEMANTIC_HTML.md)** - Semantic HTML conventions
- **[docs/DATA_ATTRIBUTES.md](docs/DATA_ATTRIBUTES.md)** - `data-*` attribute conventions (e.g. test hooks)
- **[docs/frontend-auth.md](docs/frontend-auth.md)** - Frontend auth flow details
- **[docs/backend-auth.md](docs/backend-auth.md)** - Backend auth integration details
- **[docs/backend-google-auth-implementation.md](docs/backend-google-auth-implementation.md)** - Google auth backend implementation notes

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

<!-- verify-preview-staging-api: throwaway PR to confirm Coolify PR previews resolve to the staging API, no code change intended -->

