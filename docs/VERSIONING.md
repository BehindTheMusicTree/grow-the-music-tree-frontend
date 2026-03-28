# Versioning Strategy

This document describes how application versioning is handled in CI/CD workflows.

**When to bump MAJOR, MINOR, or PATCH:** See [Semantic Versioning Guide](SEMVER_GUIDE.md) for how SemVer applies to this Next.js application.

## Table of Contents

- [Overview](#overview)
- [Version Format](#version-format)
- [Pre-Release Versions](#pre-release-versions)
  - [Development Tags (`-dev`)](#development-tags--dev-)
  - [Release Candidate Tags (`-rc`, `-beta`, `-alpha`)](#release-candidate-tags--rc--beta--alpha-)
- [How Versioning Works](#how-versioning-works)
  - [Deployment Workflow (`vercel-deploy.yml`)](#deployment-workflow-vercel-deployyml)
  - [Version Extraction Logic](#version-extraction-logic)
- [Benefits](#benefits)
- [Usage Examples](#usage-examples)
  - [Creating a Release](#creating-a-release)
  - [Development Version Tag Testing](#development-version-tag-testing)
  - [Pre-Release Version Tag Testing](#pre-release-version-tag-testing)

## Overview

The application version is derived from **git tags**. Git tags (e.g., `v0.2.0`) serve as the single source of truth for versioning. The workflow extracts the version number (e.g., `0.2.0`) from the tag name.

## Version Format

Versions follow semantic versioning with a `v` prefix:

- Format: `v<major>.<minor>.<patch>` (e.g., `v0.2.0`)
- The `v` prefix is stripped when used in workflows (e.g., `v0.2.0` → `0.2.0`)

## Pre-Release Versions

Pre-release version tags are used as release metadata before final release. They follow semantic versioning conventions and are supported by the release process. Pushing a tag does not deploy by itself; production updates follow pushes to `main` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

There are two main categories of pre-release versions, distinguished by **when** they're used and **where** they're created:

### Development Tags (`-dev`)

Development version tags are used to test builds and deployments from **feature, fix, and hotfix branches** during active development, before merging to `develop` or creating a release branch.

#### Format

- Format: `v<version>-dev-<branch-name>` (e.g., `v0.3.6-dev-improve-cicd`)
- Use the branch name **without** the type prefix (`feature/`, `fix/`, `hotfix/`, etc.)
- Example: Branch `feature/improve-cicd` → Tag `v0.3.6-dev-improve-cicd`

#### Naming Convention

Development version tags should include the branch name (without type prefix) to identify what's being tested:

- **Feature branches**: `feature/improve-cicd` → `v0.3.6-dev-improve-cicd`
- **Fix branches**: `fix/resolve-timeout` → `v0.3.6-dev-resolve-timeout`
- **Hotfix branches**: `hotfix/critical-bug` → `v0.3.6-dev-critical-bug`

#### Version Selection

Since the actual release version isn't known until the release branch is created, use these guidelines:

- **Feature/fix branches**: Typically patch or minor version updates depending on scope (e.g., `v0.3.6-dev-*` or `v0.4.0-dev-*`)
- **Hotfix branches**: Typically patch version updates (e.g., `v0.3.6-dev-*`)
- **Breaking changes**: Major version (e.g., `v1.0.0-dev-*`)

The version number is a placeholder - the actual release version is determined when creating the release branch.

#### Tag Behavior

When you push a development version tag (e.g., `v0.3.6-dev-improve-cicd`), no deployment is triggered by the tag itself.

Staging is built by **Vercel Git** when you push to `develop`; production is updated by the **Vercel deploy** workflow when you push to `main` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

#### Republishing Development Version Tags

Git tags are immutable once pushed. If you need to republish after making changes:

1. **Delete and recreate** (recommended for development version tags):

   ```bash
   git tag -d v0.3.6-dev-improve-cicd
   git push origin --delete v0.3.6-dev-improve-cicd
   git tag v0.3.6-dev-improve-cicd
   git push origin v0.3.6-dev-improve-cicd
   ```

2. **Or use incrementing suffix** (if you want to keep history):
   ```bash
   git tag v0.3.6-dev-improve-cicd-1  # First iteration
   git push origin v0.3.6-dev-improve-cicd-1
   # After changes:
   git tag v0.3.6-dev-improve-cicd-2  # Second iteration
   git push origin v0.3.6-dev-improve-cicd-2
   ```

### Release Candidate Tags (`-rc`, `-beta`, `-alpha`)

Release candidate version tags are used to test builds and deployments from **release branches** before final release. These are created during the release process when features are complete and ready for final testing.

#### Pre-Release Identifiers

- **`rc`** (Release Candidate): A version that is feature-complete and ready for final testing before release. **RC** stands for "Release Candidate" - it's a candidate for becoming the final release if testing passes.
  - Format: `v0.2.0-rc1`, `v0.2.0-rc2`, etc.
  - Example: `v0.2.0-rc1`

- **`beta`** (Beta Release): An early release for testing with most features complete but may have known issues.
  - Format: `v0.2.0-beta1`, `v0.2.0-beta2`, etc.
  - Example: `v0.2.0-beta1`

- **`alpha`** (Alpha Release): An early development release for internal testing.
  - Format: `v0.2.0-alpha1`, `v0.2.0-alpha2`, etc.
  - Example: `v0.2.0-alpha1`

#### Tag Behavior

When you push a release candidate version tag (e.g., `v0.2.0-rc1`), no deployment is triggered by the tag itself.

Production is updated by the Vercel deploy workflow on push to `main`; staging uses Vercel Git on `develop` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

### Cleanup

Test and dev tags for the released version (e.g. `v1.4.0-test`, `v1.4.0-dev-*`) are deleted automatically by postversion. Rc/beta/alpha tags are not deleted automatically; delete them manually if desired.

## How Versioning Works

### Deployment Workflow (`vercel-deploy.yml`)

When code is pushed to **`main`**, [`vercel-deploy.yml`](../.github/workflows/vercel-deploy.yml):

1. **Sets** `NEXT_PUBLIC_APP_VERSION` on Vercel **production** to `<package.json version>-dev+<shortsha>` via the Vercel API.
2. **Triggers** a **production** deployment via the `VERCEL_DEPLOY_HOOK` secret (Git production deploys for `main` are disabled in [`vercel.json`](../vercel.json); CI owns production deploys).

**Staging (`develop` and PRs):** Vercel builds from Git only. `NEXT_PUBLIC_APP_VERSION` for preview is not updated by this workflow on every `develop` push; use Vercel project env or run [**Vercel sync env**](../.github/workflows/vercel-sync-env.yml) for preview when needed.

**Other `NEXT_PUBLIC_*` variables:** Pushed only when you run the manual workflow [**Vercel sync env**](../.github/workflows/vercel-sync-env.yml) (`vercel-sync-env.yml`), not on every production deploy. See [DEPLOYMENT.md](DEPLOYMENT.md) §3.1.

## Benefits

1. **Single source of truth**: Version number is tied to git history via git tags
2. **No manual updates**: Version number is automatically derived from git tags
3. **Traceability**: Version number is directly linked to `package.json` and commit SHA
4. **Industry standard**: Follows common CI/CD best practices
5. **DRY principle**: Version number is extracted once from the git tag and used consistently

## Usage Examples

### Using npm version

The standard way to bump version in this Node/Next.js project is [npm version](https://docs.npmjs.com/cli/v10/commands/npm-version), which updates `package.json`, commits, and creates a git tag (e.g. `v1.2.3`) in one step. No extra tools required.

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
npm version 1.3.0 --no-git-tag-version   # set exact version (no commit/tag)
```

Use `--no-git-tag-version` when you only want to change `package.json` (e.g. before creating the tag manually). Otherwise `npm version` commits and tags. The `postversion` script automatically: moves `[Unreleased]` into a new `## [X.Y.Z] - YYYY-MM-DD` section and amends the version commit; then deletes local and remote test and dev tags for that version (e.g. `v1.4.0-test`, `v1.4.0-dev-*`). Rc/beta/alpha tags are not deleted automatically. Push the tag when ready: `git push origin v<version>`.

### Creating a Release

Follow GitFlow release flow:

1. Prepare and stabilize the version bump/changelog on `release/*`.
2. Open and merge a Pull Request from `release/*` to `main` (no direct merge).
3. Create the final release tag on `main` (not on `release/*`).
4. Open and merge a Pull Request from `main` to `develop` for back-merge.

Release tags are created **from main** (on the merge commit), not from the release branch. That way the tag points to the exact commit that is the canonical release and matches what is on the default branch.

```bash
# 1. Create release branch from develop and prepare release commit(s)
git checkout develop
git checkout -b release/v0.2.0
npm version minor --no-git-tag-version
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): prepare v0.2.0"

# 2. Open PR: release/v0.2.0 -> main, wait for checks/review, merge in GitHub

# 3. On updated main: create release tag from canonical merge commit
git checkout main
git pull origin main
git tag v0.2.0
git push origin v0.2.0

# 4. Open PR: main -> develop for required back-merge, merge in GitHub

# Optional: clean up pre-release/dev tags for this version
# node scripts/delete-test-dev-tags.mjs
```

### Development Version Tag Testing

For validating build metadata from feature, fix, or hotfix branches:

```bash
# On a feature branch
git checkout feature/improve-cicd
git tag v0.3.6-dev-improve-cicd
git push origin v0.3.6-dev-improve-cicd
# Tag is created for traceability; deploys follow Git/CI as in DEPLOYMENT.md
```

### Pre-Release Version Tag Testing

For creating prerelease metadata before final release:

```bash
# Option 1: Create a release candidate version tag (recommended)
git tag v0.2.0-rc1
git push origin v0.2.0-rc1

# Option 2: Create a beta version tag
git tag v0.2.0-beta1
git push origin v0.2.0-beta1

# Option 3: Create an alpha version tag
git tag v0.2.0-alpha1
git push origin v0.2.0-alpha1
```
