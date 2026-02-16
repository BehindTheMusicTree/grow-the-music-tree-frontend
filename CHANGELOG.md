# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). See [docs/SEMVER_GUIDE.md](docs/SEMVER_GUIDE.md) for when to bump MAJOR, MINOR, or PATCH.

## Table of Contents

- [Changelog Best Practices](#changelog-best-practices)
  - [General Principles](#general-principles)
  - [Guidelines for Contributors](#guidelines-for-contributors)
- [Unreleased](#unreleased)
- [0.2.0 - 2025-02-06](#020---2025-02-06)
- [v0.1.2 - 2025-03-26](#v012---2025-03-26)
- [v0.1.1 - 2024-09-29](#v011---2024-09-29)
- [v0.1.0 - 2024-09-23](#v010---2024-09-23)

## Changelog Best Practices

### General Principles

- Changelogs are for humans, not machines.
- Include an entry for every version, with the latest first.
- Group similar changes under: Added, Changed, Improved, Deprecated, Removed, Fixed, Documentation, Performance, CI.
- **"Test" is NOT a valid changelog category** - tests should be mentioned within the related feature or fix entry, not as standalone entries.
- Use an "Unreleased" section for upcoming changes.
- Follow Semantic Versioning where possible (see [docs/SEMVER_GUIDE.md](docs/SEMVER_GUIDE.md)).
- Use ISO 8601 date format: YYYY-MM-DD.
- Avoid dumping raw git logs; summarize notable changes clearly.

### Guidelines for Contributors

All contributors (including maintainers) should update `CHANGELOG.md` when creating PRs:

1. **Add entries to the `[Unreleased]` section** - Add your changes under the appropriate category (Added, Changed, Improved, Deprecated, Removed, Fixed, Documentation, Performance, CI)
2. **Follow the changelog format** - See examples below for detailed guidelines
3. **Group related changes** - Similar changes should be grouped together
4. **Be descriptive** - Write clear, user-focused descriptions of what changed
5. **Mention tests when relevant** - Tests should be mentioned within the related feature or fix entry, not as standalone entries

**Example:**

```markdown
## [Unreleased]

### Added

- **Genre Tree Visualization**: Added interactive D3.js-based genre tree component
  - Includes unit tests for tree layout calculations and node interactions
  - Supports zoom, pan, and node expansion/collapse

- **Playlist Management**: Added drag-and-drop track reordering in playlists
  - Includes integration tests for drag-and-drop functionality
  - Optimistic UI updates with automatic rollback on API failure

### Fixed

- **Audio Player**: Fixed track progress bar not updating correctly on mobile Safari
  - Includes regression tests across different browser environments
  - Improved audio event handling for better compatibility

### Performance

- **Track List**: Implemented virtualized scrolling for large track lists (1000+ items)
  - Reduced initial render time by 70%
  - Includes performance benchmarks to prevent future regressions

### CI

- **Branch Protection**: Added automated enforcement of Git Flow branching rules
  - Blocks invalid PRs to main and develop branches
```

**Note:** During releases, maintainers will move entries from `[Unreleased]` to a versioned section (e.g., `## [0.2.0] - 2025-01-XX`).

## [Unreleased]

### Added

- **Google sign-in**: Google OAuth 2.0 flow alongside Spotify. Auth popup and account page offer "Sign in with Google". Requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_REDIRECT_URI`. Backend must expose `POST auth/google/` accepting `{ code }` and returning `{ accessToken, refreshToken, expiresAt }`.

## [1.1.0] - 2025-02-15

### Added

- **Parse and log for API responses**: `parseWithLog()` helper and `useQueryWithParse` hook so endpoint hooks validate responses with Zod and log schema errors with context
- **Spotify profile URL**: `spotifyUserProfileUrl(spotifyUserId)` in routes constants for account page "Open in Spotify" link
- **Session restore gate**: `sessionRestored` flag in SessionContext so auth-dependent queries wait for localStorage session before running (avoids reconnect on refresh)

### Changed

- **Menu and auth popup**: Clicking a menu item with `authRequired: false` closes the auth popup; clicking with `authRequired: true` when not authenticated shows the auth popup and prevents navigation
- **Account page**: Profile card only when `profile.id` is set; otherwise show "Connect Spotify". Removed Country and Subscription from Profile Details (not in API). Error messages only in popups, not on page
- **Spotify user schema**: Support paginated camelCase API response (`results[0]`) via `SpotifyUserFromApiResponseSchema`; removed `country` and `product` from type and UI (not in response)
- **Invalid input errors**: Use InternalErrorPopup with dedicated code and `console.error` of error details instead of a separate InvalidInputErrorPopup

### Fixed

- **Player**: Disabled **Next** button when no next track in track list
- **Account**: Fixed Spotify endpoint path to use 'users' instead of 'user'
- **Spotify**: Streamlined account page by integrating useSpotifyUser hook and improving loading/error handling
- **Session on refresh**: Spotify user query runs only after session is restored from localStorage so users no longer need to reconnect on every page refresh

### Documentation

- **Semantic Versioning guide**: Added `docs/SEMVER_GUIDE.md` defining when to bump MAJOR, MINOR, or PATCH for this Next.js app; referenced from CHANGELOG and `docs/VERSIONING.md`; added Cursor rule `semver-guide.mdc` and updated `versioning.mdc` to use the guide

## [1.0.0] - 2025-02-12

### Added

- **global-error.tsx**: Added minimal global error boundary for static export so `/_global-error` prerenders without context (fixes "useContext of null" build failure)

- **Reference Genre Tree Page**: Added public `/reference-genre-tree` page for community-shared taxonomy
  - No authentication required - accessible to all users
  - Displays evolving genre tree contributed by the entire community
  - Read-only interface (no genre creation for public access)
  - Uses public API endpoints: `reference-genre-playlists/` and `reference/genres/tree/load/`
  - Includes comprehensive documentation and page-level docs

### Changed

- **Static export and layout**: Route group `(app)` so app shell (Providers, AppContent) only wraps main routes; root layout is minimal (html, body). Ensures `/_not-found` prerenders without client hooks (fixes "useEffect of null" on not-found). Removed duplicate PopupProvider from root layout. Added explicit viewport export and productionBrowserSourceMaps in next.config; turbopack.root set to absolute path.

- **API Endpoint Centralization**: Centralized all API endpoint definitions into domain-specific contract files
  - Created `src/api/endpoints/genres.contract.ts`, `playlists.contract.ts`, `library.contract.ts`, and `user.contract.ts`
  - Replaced hardcoded endpoint strings with centralized functions across all hooks
  - Co-located query key constants with endpoint definitions for better maintainability

- **Build Configuration**:
  - Renamed `src/proxy.ts` to `src/middleware.ts` for proper Next.js middleware handling

- **Genre Hooks Enhancement**: Added `scope === "reference"` parameter to all genre-related hooks for distinguishing regular and reference resources
  - Updated `useListGenres`, `useFetchGenre`, `useCreateGenre`, `useUpdateGenre`, `useDeleteGenre` with reference support
  - Modified endpoint functions to conditionally return reference or regular API paths

- **Endpoint Structure Refinement**: Restructured endpoint objects to use nested sub-objects instead of parameterized functions
  - Updated genre endpoints to use `genreEndpoints.me.*` and `genreEndpoints.reference.*` for better type safety
  - Updated playlist endpoints to use `playlistEndpoints.my.*`, `playlistEndpoints.full.*`, and `playlistEndpoints.reference.*`
  - Updated query keys to use `genreQueryKeys.me.*` and `genreQueryKeys.reference.*` instead of 'my' and 'myGenres'
  - Fixed all fetch wrapper calls to use correct parameter signatures across `useGenre.ts`, `useGenrePlaylist.tsx`, `useSpotifyAuth.ts`, and `useSpotifyLibTracks.ts`
  - Added complete CRUD operations to playlist and library contracts for consistency with genre contracts
  - Added missing query keys (list, detail) to playlist and library contracts to match genre contract structure
  - Restructured library contract to use factory function pattern with `me` and `reference` sections for consistency

### CI

- **Publish workflow**: Added `build` job that runs `npm ci` and `npm run build` before Docker build-and-push so app build failures are caught in CI

## [0.2.0] - 2025-02-06

### Changed

- **Next.js Upgrade**: Upgraded Next.js from 15.5.7 to 16.1.6
  - Updated eslint-config-next to 16.1.6 to match Next.js version
  - Next.js 16 includes Turbopack as default stable bundler, React Compiler support, and improved caching APIs
  - React 19.2 support and enhanced routing capabilities

- **Dependency Management**: Updated dependencies and improved version pinning
  - Removed caret (^) prefixes from all dependencies for consistent builds
  - Updated multiple dependencies: @fortawesome/react-fontawesome (0.2.0 → 3.1.1), @sentry/nextjs (9.12.0 → 10.38.0), eslint (8.57.0 → 9.39.2), jsdom (26.0.0 → 28.0.0)
  - Added package.json overrides section for glob dependency (13.0.1)
  - Added TypeScript 5.8.3 to devDependencies

- **Environment Templates**: Moved environment templates from `env/dev/template/` to `env/dev/example/`
  - Updated CONTRIBUTING.md and README.md references to new location
  - Removed deprecated template files (.env.config-generation-tester, .env.dev.template)

- **Project Rename**: Renamed project from "Bodzify Ultimate Music Guide" to "GrowTheMusicTree"
  - Updated package.json and package-lock.json with new project name
  - Updated application title and meta description in layout.tsx
  - Updated all documentation files (README.md, VISION.md, TODO.md, CONTRIBUTING.md)
  - Updated GitHub templates and discussion templates with new project name
  - Updated repository URLs from Bodzify organization to BehindTheMusicTree organization
  - Updated LICENSE copyright to BehindTheMusicTree
  - Updated CI/CD workflows with new organization references

- **Build System**: Switched from server-side rendering to static export for improved deployment
  - Added `output: 'export'` to next.config.js to enable static site generation
  - Modified entrypoint.sh to copy static build output from `out/` to `build/` directory
  - Disabled image optimization with `images: { unoptimized: true }` for compatibility with static export
  - Removed middleware (src/middleware.ts) as it's incompatible with static export
  - Added root page (src/app/page.tsx) with redirect to `/my-genre-tree`
  - Enables serving via static file server (Nginx) instead of Node.js runtime
  - Reduces container resource requirements and improves deployment flexibility

### Documentation

- **Project Documentation Setup**: Comprehensive documentation structure for open-source project
  - Added CONTRIBUTING.md with Git Flow workflow, development guidelines, and PR process
  - Added VISION.md with project mission, values, roadmap, and target audience
  - Added TODO.md for tracking future work organized by priority and category
  - Added CODE_OF_CONDUCT.md based on Contributor Covenant 2.1
  - Simplified README.md with clear structure: features, tech stack, quick start
  - Added changelog best practices guide with examples for React/Next.js frontend

- **GitHub Templates**: Added comprehensive issue and PR templates
  - Bug report template with browser, OS, and device information fields
  - Feature request template with component/area and priority selection
  - Pull request template with detailed checklist for code quality, testing, and documentation
  - Issue template config to guide users to appropriate resources

- **GitHub Discussions**: Added discussion welcome template
  - Defined discussion categories (Ideas, Q&A, Music & Genres, Show and Tell, Announcements, Development)
  - Community guidelines and best practices
  - Instructions for effective participation

- **License**: Added Apache License 2.0 with references across documentation

- **GitHub Labels**: Added comprehensive labeling system for issues and PRs
  - Created LABELS.md documentation with full label catalog and usage guidelines
  - Added executable script to create all labels via GitHub CLI
  - Defined 9 label categories: type, priority, component, technology, status, size, special, platform
  - Added automatic PR labeling workflow based on file changes
  - Updated CONTRIBUTING.md with labels section

- **Versioning Documentation**: Added comprehensive versioning strategy documentation
  - Created `docs/VERSIONING.md` with complete versioning strategy and tag naming conventions
  - Documents semantic versioning format, pre-release versions (dev, rc, beta, alpha), and version extraction logic
  - Includes usage examples for creating releases, development tags, and pre-release tags
  - Documents cleanup process for pre-release tags

- **Development Workflow**: Enhanced CONTRIBUTING.md with testing builds during development
  - Added section on testing builds from feature/hotfix branches using development tags
  - Guidelines for choosing version numbers for dev tags
  - Instructions for republishing development tags after changes
  - Added cleanup steps for pre-release tags in release process
  - Reorganized branch protection section for better clarity
  - Updated installation instructions to use `npm install --legacy-peer-deps` flag
  - Documented peer dependency conflict handling, particularly with ESLint 9 and its plugins

- **Installation Instructions**: Updated README.md and CONTRIBUTING.md with legacy peer deps flag
  - Added `--legacy-peer-deps` flag to npm install commands for consistent dependency resolution
  - Documented reason: handles peer dependency conflicts, especially with ESLint 9 and plugins
  - Ensures consistency between local development and Docker builds

### CI

- **PR Description Workflow**: Added cursor rule for PR description management
  - PR descriptions must be drafted in `.pr-descriptions/` directory (git-ignored)
  - Ensures use of PR template and iterative refinement before publishing
  - Added `.pr-descriptions/` to .gitignore

- **Versioning Strategy**: Refactored CI/CD workflows to extract version from git tags
  - Replaced `deploy.yml` with `publish.yml` workflow
  - Version is now extracted dynamically from git tags instead of GitHub variables
  - Supports semantic versioning with `v` prefix (e.g., `v0.2.0`)
  - Supports pre-release versions: development tags (`-dev`), release candidates (`-rc`, `-beta`, `-alpha`)
  - Version extraction logic: extracts from tag ref when triggered by tag push, falls back to latest tag otherwise
  - Removed dependency on `APP_VERSION` GitHub variable
  - Version is passed between jobs via workflow outputs

- **Auto-labeler Workflows**: Added comprehensive automated labeling system
  - **File-based PR labeler**: Applies component/technology labels based on changed files
  - **PR size labeler**: Automatically calculates and labels PR size (xs/s/m/l/xl) with line counts
  - **PR type labeler**: Detects PR type from title/description (feat, fix, docs, etc.) and breaking changes
    - Improved breaking change detection to avoid false positives from template text
    - Detects breaking changes via '!' in title, checked checkbox, "BREAKING CHANGE:" note, or content in Breaking Changes section
    - Improved dependency detection to avoid false positives from template checklist text
    - Only labels as dependencies when title/description explicitly mentions dependency updates, package.json changes, or dependabot
  - **Issue labeler**: Auto-labels issues by type, component, browser, platform, priority, and keywords
  - Reduces manual labeling overhead and ensures consistent label application

- **Branch Protection**: Added Git Flow branch protection workflow
  - Enforces branch naming conventions for PRs to `main` (hotfix/_, release/_ only)
  - Enforces branch naming conventions for PRs to `develop` (feature/_, chore/_, dependabot/\_ only)
  - Automatically comments on invalid PRs with clear instructions
  - Prevents merging branches that don't follow Git Flow workflow

- **Testing Infrastructure**: Added comprehensive testing setup with Vitest
  - Configured Vitest 3.2.4 with React Testing Library for component testing
  - Added test scripts: test, test:watch, test:ui, test:coverage
  - Created 31 passing tests for utilities and UI components
  - Uses happy-dom for faster test execution (2-4x faster than jsdom)
  - Includes @vitest/ui for interactive test debugging

- **CI/CD Refactoring**: Split monolithic CI workflow following Git Flow best practices
  - Created separate workflows: ci.yml (validation), deploy-test.yml, deploy-prod.yml
  - Added reusable deployment workflow (deploy-reusable.yml) to eliminate code duplication
  - Renamed `dev` branch to `develop` following standard Git Flow naming
  - Deploy runs on push to develop and workflow_dispatch

- **Workflows – Vars and secrets check**: First step in each workflow verifies required vars and secrets
  - Validate: no vars/secrets required (step passes)
  - Deploy: checks 15 vars and 3 secrets; fails with list of unset names if any missing

- **Deployment – Spotify Integration**: Added Spotify environment variables to deployment workflow
  - Added NEXT_PUBLIC_SPOTIFY_AUTH_URL, NEXT_PUBLIC_SPOTIFY_CLIENT_ID, NEXT_PUBLIC_SPOTIFY_REDIRECT_URI, and NEXT_PUBLIC_SPOTIFY_SCOPES to server environment configuration
  - Added SPOTIFY_CLIENT_ID to required vars validation

- **Docker Environment Variables**: Simplified environment variable handling in Docker containers
  - Updated entrypoint script to require NEXT*PUBLIC* variables directly instead of non-prefixed versions
  - Removed unnecessary conversion step from non-prefixed to NEXT*PUBLIC* variables
  - Removed unused MUSIC_TREE_API_USERNAME, MUSIC_TREE_API_USER_PASSWORD, SENTRY_AUTH_TOKEN requirements
  - Updated workflows to set NEXT*PUBLIC* variables directly in environment files
  - Fixed "CONTACT_EMAIL must be set" error in dockerized environment

- **CI Configuration**: Fixed Spotify client ID configuration in workflows
  - Corrected SPOTIFY_CLIENT_ID to use GitHub secret instead of variable in publish.yml workflow

- **Node.js Version Management**: Added .nvmrc to specify Node.js 20 LTS requirement
  - Documents required Node.js version for team consistency
  - Prevents build issues with experimental Node versions (Node 23 SIGBUS errors)
  - Matches GitHub Actions CI Node version (20)
  - Enables automatic version switching with nvm

- **Cursor Rules**: Added versioning rule for AI assistance
  - Created `.cursor/rules/versioning.mdc` to guide AI on versioning and tagging conventions
  - Ensures workflows extract version from git tags, not from variables
  - Documents tag naming guidelines for development, pre-release, and release tags
  - Provides version extraction pattern for GitHub Actions workflows

- **CI/CD Server Adaptation**: Updated deployment workflows for new server configuration
  - Updated publish.yml workflow with new secret name for Spotify client ID
  - Added deploy.yml workflow for single environment deployment
  - Adapted workflows to work with new server infrastructure

### Fixed

- **TypeScript Errors**: Resolved multiple type-related build blockers
  - Fixed GenreDeletionPopup type mismatch by adding uuid to Genre interface
  - Completed all error code mappings in app-error-messages.ts (10 errors resolved)
  - Excluded vitest.config.ts from tsconfig to fix moduleResolution conflicts
  - Wrapped useSearchParams in Suspense boundary for Next.js compatibility

- **Build Issues**: Fixed local build failures and image optimization
  - Added sharp ^0.34.5 with Node 20 compatible binaries for Next.js image optimization
  - Regenerated package-lock.json with Node 20 compatible dependencies
  - Updated next-env.d.ts with Next.js 15.5.6 auto-generated routes reference

## [v0.1.2] - 2025-03-26

### Changed

- Upgraded to API version 0.1.2
- Refactored API service into services for better code organization

## [v0.1.1] - 2024-09-29

This release includes enhancements to the tree design and several important bug fixes.

### Enhanced

- Improved tree design for better visualization and usability.

### Fixed

- Resolved issues with the player functionality.
- Prevented genre updates on Genreless.
- Fixed the issue where Genreless was hidden when the player was visible.
- Corrected the track duration display to avoid NaN values.
- Improved handling of long tracklist names to ensure proper display.

## [v0.1.0] - 2024-09-23

### Added

- Initial release
