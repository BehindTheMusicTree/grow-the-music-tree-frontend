# Grow the Music Tree Frontend

A community-driven platform for exploring and understanding musical genres through an interactive, evolving genre tree map.

This project is statically generated and intended to be served as static files (CDN / Nginx / object storage).

## Table of Contents

- [Overview](#overview)
- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Rendering Strategy](#rendering-strategy)
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
- AI-powered genre detection for tracks
- Smart playlist generation based on musical journeys
- Community discussions and voting on genre classifications
- Rich contextual information for each genre (historical, cultural, technical)

## Pages

- Home (`/`)
- Account (`/account`)
- Spotify Auth Callback (`/auth/spotify/callback`)
- Genre Playlists (`/genre-playlists`)
- Genre Tree (`/genre-tree`)
- Spotify Library (`/spotify-library`)
- Uploaded Library (`/uploaded-library`)

See `docs/pages/` for detailed page documentation.

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Rendering:** Static Site Generation (SSG)
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **CI:** GitHub Actions
- **Containerization:** Docker (build-only)
- **Additional libraries:** React 19, D3.js, TanStack Query, React Howler, Sentry

## Rendering Strategy

This project uses static generation only:

- `next build` generates static assets
- Output is served as plain HTML/CSS/JS
- No Node.js runtime is required in production

Typical hosting targets:

- CDN
- Nginx
- Cloud storage (S3, GCS, etc.)
- Docker static server

## Project Structure

```
.
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── features/          # Feature-specific components
│   └── ui/                # Reusable UI components
├── contexts/              # React contexts for state management
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and helpers
├── models/                # Data models and types
├── schemas/               # API and domain schemas
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── public/                # Static assets
├── env/                   # Environment configuration
├── scripts/               # Build and setup scripts
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
cp env/dev/example/.env.dev.example .env.local
```

**Example variables:**

```
NODE_ENV=development
PORT=3000

NEXT_PUBLIC_CONTACT_EMAIL=your-email@example.com
NEXT_PUBLIC_BACKEND_BASE_URL=https://api.themusictree.org/v0.4.0/
NEXT_PUBLIC_SENTRY_IS_ACTIVE=false

NEXT_PUBLIC_SPOTIFY_AUTH_URL=https://accounts.spotify.com/authorize
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your-spotify-client-id
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=/auth/spotify/callback
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-email playlist-read-private playlist-read-collaborative user-library-read user-top-read
```

**Notes:**

- Only variables prefixed with `NEXT_PUBLIC_` are available in the browser
- Changing env values requires a new build
- Do not commit `.env.local`

## Getting Started

### Prerequisites

- Node.js >= 18
- npm / yarn / pnpm
- Docker (optional, for containerized builds)

### Install dependencies

```bash
npm install --legacy-peer-deps
```

**Note:** We use `--legacy-peer-deps` to handle peer dependency conflicts, particularly with ESLint and its plugins.

## Scripts

| Command                 | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start local development server                       |
| `npm run build`         | Generate static production build                     |
| `npm run start`         | Start production server (not used for static builds) |
| `npm run lint`          | Run ESLint                                           |
| `npm run verify-env`    | Verify environment configuration                     |
| `npm run test`          | Run unit tests                                       |
| `npm run test:watch`    | Run tests in watch mode                              |
| `npm run test:ui`       | Run tests with UI                                    |
| `npm run test:coverage` | Run tests with coverage                              |

## Docker

Docker is used only for building and serving static files.

**Dockerfile (excerpt):**

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/out /usr/share/nginx/html
```

**Build image:**

```bash
docker build -t grow-the-music-tree-frontend .
```

**Run container:**

```bash
docker run -p 8080:80 grow-the-music-tree-frontend
```

## CI

Continuous Integration runs on each push to main branch and pull requests.

The CI pipeline includes:

- Dependency installation
- Linting
- Testing
- Static build generation
- Docker image build and push
- Deployment to production server

**GitHub Actions workflow** (simplified):

```yaml
name: Publish

on:
  push:
    tags: ["*"]
  workflow_call:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - name: Build and push Docker image
        # ... (additional deployment steps)
```

## Build & Hosting

### Build output

Static files are generated via:

```bash
npm run build
```

Output directory: `out/` (static export)

### Hosting options

- **CDN:** Serve static files directly from a CDN
- **Nginx:** Configure Nginx to serve the `out/` directory
- **Docker + Nginx:** Use the provided Dockerfile
- **Cloud object storage:** Upload `out/` contents to S3, GCS, etc.

## Troubleshooting

- **Environment variables not applied:** Rebuild required after env changes
- **Clear local cache:**
  ```bash
  rm -rf .next out node_modules
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

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
