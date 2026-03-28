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

**Release identity** is a **semver tag** on `main` (e.g. `v0.2.0`). Production deploy runs when that tag is pushed (see below), not on every merge to `main`.

**`npm version`** for a shipping release runs **only on `main`**, after **`release/*` or `hotfix/*` is merged into `main` via PR** ([CONTRIBUTING.md](../CONTRIBUTING.md) §7). Prepare `package.json` / changelog on `release/*` with `npm version … --no-git-tag-version` if needed; the **tag** and **postversion** changelog move happen when you run **`npm version` on `main`**.

**`package.json` `version`** is the string synced to `NEXT_PUBLIC_APP_VERSION` and shown in the app. For a tag-triggered deploy it **must equal** the tag (`v0.2.0` → `0.2.0`). A manual **Vercel deploy** run (`workflow_dispatch`) still uses `package.json` only.

**Pre-release and dev tags** (`v1.0.0-rc1`, `v0.3.0-dev-*`, etc.) do **not** trigger production deploy.

## Version Format

Versions follow semantic versioning with a `v` prefix:

- Format: `v<major>.<minor>.<patch>` (e.g., `v0.2.0`)
- The `v` prefix is stripped when used in workflows (e.g., `v0.2.0` → `0.2.0`)

## Pre-Release Versions

Pre-release version tags are used as release metadata before final release. They follow semantic versioning conventions and are supported by the release process. Pushing them does **not** trigger production deploy; only a plain semver tag `vMAJOR.MINOR.PATCH` does (see [DEPLOYMENT.md](DEPLOYMENT.md)).

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

Staging is built by **Vercel Git** when you push to `develop`; production is updated when you push a **semver release tag** or run **Vercel deploy** manually (see [DEPLOYMENT.md](DEPLOYMENT.md)).

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

Production is updated by the Vercel deploy workflow on push of a semver release tag (or manual run); staging uses Vercel Git on `develop` (see [DEPLOYMENT.md](DEPLOYMENT.md)).

### Cleanup

Test and dev tags for the released version (e.g. `v1.4.0-test`, `v1.4.0-dev-*`) are deleted automatically by postversion. Rc/beta/alpha tags are not deleted automatically; delete them manually if desired.

## How Versioning Works

### Deployment Workflow (`vercel-deploy.yml`)

[`vercel-deploy.yml`](../.github/workflows/vercel-deploy.yml) runs when you push a **semver release tag** `vMAJOR.MINOR.PATCH` (e.g. `v1.4.4`), or when you run it manually (**Actions → Vercel deploy**):

1. **Sets** `NEXT_PUBLIC_APP_VERSION` on Vercel **production** from **`package.json` `version`**, after checking that the tag (if any) matches that version. **Preview** env (manual full sync) still uses `<version>-dev+<shortsha>`.
2. **Triggers** a **production** deployment via the `VERCEL_DEPLOY_HOOK` secret (Git production deploys for `main` are disabled in [`vercel.json`](../vercel.json); CI owns production deploys).

Merging to **`main` alone does not** run this workflow; push the release tag (or use manual dispatch to redeploy).

**Staging (`develop` and PRs):** Vercel builds from Git only. `NEXT_PUBLIC_APP_VERSION` for preview is not updated by this workflow on every `develop` push; use Vercel project env or run [**Vercel sync env**](../.github/workflows/vercel-sync-env.yml) for preview when needed.

**Other `NEXT_PUBLIC_*` variables:** Pushed only when you run the manual workflow [**Vercel sync env**](../.github/workflows/vercel-sync-env.yml) (`vercel-sync-env.yml`), not on every production deploy. See [DEPLOYMENT.md](DEPLOYMENT.md) §3.1.

### Version Extraction Logic

For **production** in `app-version-only` mode ([`scripts/vercel-sync-env-from-github.sh`](../scripts/vercel-sync-env-from-github.sh)):

- **Tag push** `refs/tags/vX.Y.Z`: `X.Y.Z` must equal `package.json` `version`; that value is written to `NEXT_PUBLIC_APP_VERSION`.
- **`workflow_dispatch`**: uses `package.json` `version` only (for redeploys without a new tag).

Any other context fails with a clear error so production cannot be updated from an unexpected ref.

## Benefits

1. **Single source of truth**: Shipped releases are tagged on `main`; `package.json` must match the tag at deploy time
2. **Controlled production deploys**: Production ships on release tag (or explicit manual workflow), not on every merge to `main`
3. **Traceability**: Tag, `package.json`, and commit line up for each production deploy
4. **Industry standard**: Follows common CI/CD best practices
5. **DRY principle**: One release tag and matching `package.json` version per production deploy

## Usage Examples

### Using npm version

The standard way to bump version in this Node/Next.js project is [npm version](https://docs.npmjs.com/cli/v10/commands/npm-version), which updates `package.json`, commits, and creates a git tag (e.g. `v1.2.3`) in one step. No extra tools required.

```bash
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0
npm version 1.3.0 --no-git-tag-version   # set exact version (no commit/tag)
```

Use `--no-git-tag-version` on **`release/*`** to bump `package.json` and prepare changelog without creating a tag. For the **final** release, run **`npm version` on `main`** (without `--no-git-tag-version`) so the tool commits, tags, and runs `postversion`. The `postversion` script moves `[Unreleased]` into `## [X.Y.Z] - YYYY-MM-DD`, amends the version commit, recreates **`vX.Y.Z`**, and deletes test/dev tags for that version. Rc/beta/alpha tags are not deleted automatically. From **`main`**: `git push origin main` and `git push origin v<version>`.

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

# 3. On updated main: npm version creates commit + v0.2.0 tag (postversion updates CHANGELOG)
git checkout main
git pull origin main
npm version minor   # or patch / major — must match prepared release
git push origin main
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
