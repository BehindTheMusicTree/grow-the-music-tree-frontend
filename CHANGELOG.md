# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Changelog Best Practices

### General Principles

- Changelogs are for humans, not machines.
- Include an entry for every version, with the latest first.
- Group similar changes under: Added, Changed, Improved, Deprecated, Removed, Fixed, Documentation, Performance, CI.
- **"Test" is NOT a valid changelog category** - tests should be mentioned within the related feature or fix entry, not as standalone entries.
- Use an "Unreleased" section for upcoming changes.
- Follow Semantic Versioning where possible.
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

### Changed

- **Project Rename**: Renamed project from "Bodzify Ultimate Music Guide" to "Grow The Music Tree"
  - Updated package.json and package-lock.json with new project name
  - Updated application title and meta description in layout.tsx
  - Updated all documentation files (README.md, VISION.md, TODO.md, CONTRIBUTING.md)
  - Updated GitHub templates and discussion templates with new project name
  - Updated repository URLs from Bodzify organization to BehindTheMusicTree organization
  - Updated LICENSE copyright to BehindTheMusicTree
  - Updated CI/CD workflows with new organization references

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
  - Created separate workflows: validate.yml (lint, test, build), deploy.yml (single environment)
  - Renamed `dev` branch to `develop` following standard Git Flow naming
  - Deploy runs on push to develop and workflow_dispatch

- **Workflows – Vars and secrets check**: First step in each workflow verifies required vars and secrets
  - Validate: no vars/secrets required (step passes)
  - Deploy: checks 15 vars and 3 secrets; fails with list of unset names if any missing

- **Deployment – Spotify Integration**: Added Spotify environment variables to deployment workflow
  - Added NEXT_PUBLIC_SPOTIFY_AUTH_URL, NEXT_PUBLIC_SPOTIFY_CLIENT_ID, NEXT_PUBLIC_SPOTIFY_REDIRECT_URI, and NEXT_PUBLIC_SPOTIFY_SCOPES to server environment configuration
  - Added SPOTIFY_CLIENT_ID to required vars validation

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

### Fixed

- **TypeScript Errors**: Resolved multiple type-related build blockers
  - Fixed GenreDeletionPopup type mismatch by adding uuid to Genre interface
  - Completed all error code mappings in app-error-messages.ts (10 errors resolved)
  - Excluded vitest.config.ts from tsconfig to fix moduleResolution conflicts
  - Wrapped useSearchParams in Suspense boundary for Next.js 15 compatibility

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
