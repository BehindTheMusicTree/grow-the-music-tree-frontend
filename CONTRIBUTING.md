# 🧭 Contributing Guidelines

Thank you for your interest in contributing!

This project is currently maintained by a solo developer, but contributions, suggestions, and improvements are welcome.

## Table of Contents

- [🧑‍🤝‍🧑 Contributors vs Maintainers](#-contributors-vs-maintainers)
  - [Roles Overview](#roles-overview)
  - [Infrastructure & Automation Permissions](#infrastructure--automation-permissions)
- [🧱 Development Workflow](#-development-workflow)
  - [0. Fork & Clone](#0-fork--clone)
  - [1. Environment Setup](#1-environment-setup)
  - [2. Branching](#2-branching)
  - [3. Developing](#3-developing)
  - [4. Testing](#4-testing)
    - [4.1. Testing Builds During Development](#41-testing-builds-during-development)
  - [5. Committing](#5-committing)
  - [6. Pull Request Process](#6-pull-request-process)
    - [6.1. Pre-PR Checklist](#61-pre-pr-checklist)
    - [6.2. Opening a Pull Request](#62-opening-a-pull-request)
  - [7. Releasing _(For Maintainers)_](#7-releasing-for-maintainers)
- [🏷️ Issue & PR Labels](#️-issue--pr-labels)
- [🪪 License & Attribution](#-license--attribution)
- [📜 Code of Conduct](#-code-of-conduct)
- [📋 TODO List](#-todo-list)
- [🌍 Contact & Discussions](#-contact--discussions)

## 🧑‍🤝‍🧑 Contributors vs Maintainers

### Roles Overview

**Contributors**

Anyone can be a contributor by:

- Submitting bug reports or feature requests via GitHub Issues (use the issue templates when available)
- Proposing code changes through Pull Requests (the PR template will guide you through the process)
- Improving documentation
- Participating in discussions
- Testing and providing feedback

**Maintainers**

The maintainer(s) are responsible for:

- Reviewing and merging Pull Requests
- Managing releases and versioning
- Ensuring code quality and project direction
- Responding to critical issues
- Maintaining the project's infrastructure
- Creating and managing hotfix branches for urgent production fixes
- Creating and managing release branches for preparing releases
- Preparing releases on `release/*` branches, merging via PR to `main`, checking the automated tag, and back-merging to `develop` via PR
- Managing repository automation (stale issues/PRs, auto-labeling, auto-assignment, etc.)

**Important:** Even maintainers must go through Pull Requests. No direct commits to `main` or `develop` are allowed - all changes, including those from maintainers, must be submitted via Pull Requests and go through the standard review process.

_Note: Contributors can submit fixes for critical issues via feature branches. Maintainers may promote these to hotfix branches when urgent production fixes are needed._

### Infrastructure & Automation Permissions

**Repository automation policies (maintainer-only):**

- Publishing workflows (`.github/workflows/*.yml`) - handles sensitive secrets and can publish packages
- Stale issues/PRs workflow - affects repository management policies
- Auto-assignment workflows - affects review process
- Auto-labeler workflow (`.github/workflows/labeler.yml`) - automatically labels PRs based on changed files
- Other automation workflows that affect repository management

**Auto-labeling configuration (contributors can suggest changes via PRs):**

- Auto-labeling configuration (`.github/labeler.yml`) - contributors can suggest updates when adding new features/components
- Example: If adding a new page or component, contributor can suggest adding label rules for that component
- Maintainers review and approve label configuration changes

**Why most automation is maintainer-only:**

- These workflows implement repository policies and management decisions
- Changes can affect how issues/PRs are handled, categorized, and maintained
- They require understanding of project management strategy

**What contributors can do:**

- Suggest changes to auto-labeling configuration (`.github/labeler.yml`) via PRs, especially when adding new features/components
- Suggest improvements or report issues with automation via GitHub Issues
- Add/remove labels on their own issues and PRs (type labels like `bug`, `enhancement`, priority labels, etc.)
- Discuss automation behavior in discussions or issues

**What contributors cannot do:**

- Modify automation workflows (stale, auto-assignment, etc.) - these are policy decisions
- Create or delete repository labels (maintainer-only) - repository labels are the label definitions (like `bug`, `enhancement`, `ui`, `feature`) that exist in the repository's label list
- Modify labels on issues/PRs they didn't create (unless they have write access)

Currently, this project has a solo maintainer, but the role may expand as the project grows.

## 🧱 Development Workflow

We follow a **strict Git Flow** model:

**Workflow steps:** Fork & Clone → Environment Setup → Branching → Developing → Testing → Committing → Pull Request Process (including Pre-PR Checklist) → Releasing _(For Maintainers)_

### 0. Fork & Clone

**For contributors:**

1. Fork the repository on GitHub
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/grow-the-music-tree-frontend.git
   cd grow-the-music-tree-frontend
   ```

**For maintainers:**

Clone the main repository directly:

```bash
git clone https://github.com/BehindTheMusicTree/grow-the-music-tree-frontend.git
cd grow-the-music-tree-frontend
```

### 1. Environment Setup

#### Prerequisites

- **Node.js 26** (see `.nvmrc`)
- **npm** (comes with Node.js)
- **Git**

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BehindTheMusicTree/grow-the-music-tree-frontend.git
   cd grow-the-music-tree-frontend
   ```

2. Install dependencies:

   The **`@behindthemusictree/*`** packages are public on npmjs, so no token is needed:

   ```bash
   npm install --legacy-peer-deps
   ```

   **Note:** We use `--legacy-peer-deps` to handle peer dependency conflicts, particularly with ESLint 9 and its plugins. This ensures consistent dependency resolution across local development and Docker builds.

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the secrets listed there. Non-secret dev defaults live in the committed `.env`, which targets a local grow-api at `http://127.0.0.1:8001`. Missing or invalid values fail fast at `pnpm dev` with a message naming them (see `src/lib/env.ts` and `src/lib/env.server.ts`).

4. Start the development server:

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

#### Backend Requirement

This frontend application requires TheMusicTreeAPI backend to function. You can find TheMusicTreeAPI on GitHub at: [TheMusicTreeAPI](https://github.com/BehindTheMusicTree/bodzify-api-django)

For development, run grow-api locally (`docker compose up` in [grow-the-music-tree-api](https://github.com/BehindTheMusicTree/grow-the-music-tree-api)); the committed `.env` points at it. For read-only UI work against staging data, set `GROW_API_ORIGIN=https://grow-api-staging.themusictree.org` in `.env.local` (admin sign-in won't work there).

### 2. Branching

We follow **strict Git Flow** with the following branch structure:

#### Main Branch (`main`)

- The production-ready, stable branch
- All tests must pass before merging
- Releases are tagged from `main`
- **No direct commits allowed** - All changes must go through Pull Requests, including changes from maintainers
- Only receives merges from `release/*` and `hotfix/*` branches
- **Branch protection enforced** - GitHub Actions automatically blocks PRs to `main` that don't come from `hotfix/*` or `release/*` branches (see `.github/workflows/branch-protection.yml`)

#### Develop Branch (`develop`)

- The integration branch for ongoing development
- All feature branches merge into `develop`
- `develop` is merged into `main` via release branches
- **No direct commits allowed** - All changes must go through Pull Requests
- **Valid PR source branches** are enforced by `.github/workflows/branch-protection.yml` (see **Branch Protection** below)

#### 🛡️ Branch Protection

- **PRs to `main`** must come from `hotfix/*` or `release/*` branches only. This ensures production fixes are traceable and carefully released.
- **PRs to `develop`** may come only from branches whose names start with one of: `feature/`, `dependabot/`, `release/`, `hotfix/`, or from the branch named exactly `main` (post-release or post-hotfix back-merge). Anything else (including `fix/*`, `chore/*`, `ci/*`, `refactor/*`, etc.) is **rejected** by CI. `fix/*` and `chore/*` are **not strict Gitflow** — use **`feature/*`** for bug fixes and CI/CD, workflow, and tooling changes (e.g. `feature/resolve-audio-preview-timeout`, `feature/update-validate-workflow`).
- Branch protection is enforced by the `branch-protection.yml` GitHub Actions workflow located at `.github/workflows/branch-protection.yml`.
- **Invalid PRs will:**
  - Fail the CI check
  - Receive an automated comment with clear instructions
  - Be blocked from merging until the branch is renamed or retargeted

#### Feature Branches (`feature/<name>`)

- Create one for each new feature or bug fix
- Branch from `develop`
- Include issue numbers when applicable: `feature/123-add-playlist-export`
- Examples:

  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/improve-track-list-performance

  git checkout -b feature/123-add-playlist-export        # With issue number
  git checkout -b feature/456-fix-mobile-player-ui       # With issue number
  ```

- Merge into `develop` via Pull Request when complete and tested

#### Release Branches (`release/<version>`) _(For Maintainers)_

- Created from `develop` when preparing a new release
- Used for final testing, bug fixes, and version bumping
- Examples:

  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b release/v0.2.1
  ```

- Only bug fixes and release-related changes go into release branches
- When ready, open a PR from `release/*` to `main` (no direct merge), then check the automated tag on `main` after the PR merge
- After tagging, open a PR from `main` to `develop` for the required back-merge (no direct merge)
- Release grow-api to prod first. A PR that consumes a new grow-api field bumps `growApi.minVersion` in `package.json` to the grow-api release that ships it; the `grow-api contract (prod)` check on PRs to `main` and the prod deploy job fail while prod is older

#### Hotfix Branches (`hotfix/<name>`) _(For Maintainers)_

- For urgent bug fixes on production versions
- Branch from `main`
- Include issue numbers when applicable: `hotfix/789-critical-bug`
- Examples:

  ```bash
  git checkout main
  git pull origin main
  git checkout -b hotfix/critical-metadata-bug

  git checkout -b hotfix/789-critical-security-patch   # With issue number
  ```

- Contributors can submit fixes via feature branches that maintainers may promote to hotfixes if needed
- When complete, open a PR from `hotfix/*` to `main` (no direct merge), check the automated tag, then open a PR from `main` to `develop` for back-merge

#### Dependabot Branches (`dependabot/*`)

- For automated dependency updates created by [Dependabot](https://github.com/dependabot)
- Typically generated/managed by GitHub and follow a naming convention like `dependabot/<ecosystem>/<package>-<version>` (e.g., `dependabot/npm_and_yarn/lodash-4.17.21`)
- Branch from `develop`
- Dependabot opens Pull Requests that should target `develop` for dependency bumps and security updates
- Merge into `develop` via Pull Request when complete; treat them as dependency maintenance

### 3. Developing

#### Code & styling guidelines

See [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) for code conventions (TypeScript, React, file naming, directories) and UI styling (Tailwind, class order, common patterns).

### 4. Testing

Testing setup is currently in development. Basic testing infrastructure includes:

```bash
# Run linting
npm run lint

# Build the application (verifies no build errors)
npm run build

# Start production build locally
npm run start
```

#### Manual Testing Checklist

When testing your changes, verify:

- ✅ Component renders correctly in different screen sizes (responsive design)
- ✅ Functionality works as expected in Chrome, Firefox, and Safari
- ✅ No console errors or warnings
- ✅ Accessibility features work (keyboard navigation, screen readers)
- ✅ Loading states and error handling work correctly
- ✅ API interactions function properly

#### 4.1. Testing Builds During Development

You can validate that your branch builds successfully by running local CI checks (`npm run lint`, `npm run test`, `npm run build`) before opening a PR. Deployment is handled by Coolify, which auto-builds staging on every push to `develop` and production on every push to `main` — there is no tag or manual-dispatch gate (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

Stable release tags are created by the release workflow after a version change reaches
`main`. Do not create, move, or delete release tags manually. Staging deploys from
`develop` and production deploys from `main`; tags do not trigger deployment.

### 5. Committing

We follow a structured commit format inspired by [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

**Quick reference:**

- Format: `<type>(<scope>): <summary>`

**Commit Types:**

- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code restructuring
- `docs` - Documentation update
- `chore` - Maintenance / infrastructure
- `test` - Adding or updating tests
- `style` - Formatting / lint-only changes
- `perf` - Performance improvement
- `ci` - CI/CD pipeline changes

**Examples:**

- `feat(player): add shuffle mode`
- `fix(genre-tree): handle empty genre nodes`
- `docs: update setup instructions`
- `test(track-list): add unit tests for sorting`
- `chore: update dependencies`
- `perf(track-list): implement virtualized scrolling`
- `style: format code with prettier`

**Commit Message Guidelines:**

- Use imperative mood ("Add…", "Fix…", "Update…")
- Keep summary under ~70 characters
- Include issue/ticket IDs when applicable (e.g., `fix(#482): handle null values`)
- Be descriptive but concise

### 6. Pull Request Process

#### 6.1. Pre-PR Checklist

Before submitting a Pull Request, ensure the following checks are completed:

**1. Code Quality**

- ✅ Follow React and Next.js best practices
- ✅ Use TypeScript types/interfaces appropriately
- ✅ Components are properly structured and reusable
- ✅ No console.log statements or debug code
- ✅ Code follows Tailwind CSS conventions

**2. Testing**

- ✅ Manual testing completed (see [Testing](#4-testing) section)
- ✅ Tested on multiple browsers (Chrome, Firefox, Safari)
- ✅ Tested on mobile devices (responsive design)
- ✅ No build errors: `npm run build`
- ✅ No linting errors: `npm run lint`

**3. Documentation**

- ✅ Update component documentation if needed
- ✅ Update README or other documentation if adding new features
- ✅ Add JSDoc comments for complex functions
- ✅ Update `CHANGELOG.md` with your changes in the `[Unreleased]` section
- ⚠️ Update CONTRIBUTING.md only in exceptional cases

**4. Git Hygiene**

- ✅ Commit messages follow the commit message convention
- ✅ Branch is up to date with target branch (`develop` for features, `main` for hotfixes)
- ✅ No accidental commits (large files, secrets, personal configs, `.env` files)
- ✅ Branch follows naming convention for the target branch (see **Branch Protection**): for PRs to `develop`, use `feature/*`, `dependabot/*`, or (maintainers) `release/*`, `hotfix/*`, or `main` for back-merge; for PRs to `main`, use `release/*` or `hotfix/*` only

**5. Branch Target**

- ✅ Feature branches target `develop` branch (NOT `main`)
- ✅ Hotfix branches target `main` branch
- ✅ Release branches target both `main` and `develop` (maintainers only)
- ✅ Chore branches target `develop` branch (NOT `main`)

**6. PR Description**

- ✅ PR description drafted in `.pr-descriptions/<branch-name>.md` (see [PR Description Workflow](#pr-description-workflow) below)
- ✅ All sections of the PR template are filled out
- ✅ Screenshots/recordings included for UI changes

#### For Maintainers (Before Opening/Merging a PR)

**All Contributor Checks Plus:**

**1. Code Review**

- ✅ Code follows project conventions and style
- ✅ Logic is sound and well-structured
- ✅ Error handling is appropriate
- ✅ Performance considerations addressed (if applicable)
- ✅ React and Next.js best practices are followed

**2. Testing Verification**

- ✅ Build completes successfully
- ✅ Manual testing completed across browsers
- ✅ Edge cases are handled
- ✅ Integration with existing features works correctly

**3. Documentation Review**

- ✅ Component changes are documented
- ✅ Breaking changes are clearly marked and documented
- ✅ Examples and usage are updated if needed
- ✅ Update CONTRIBUTING.md if changing development workflow

**4. Compatibility Verification**

- ✅ Breaking changes have proper versioning plan (major version bump)
- ✅ Backward compatibility maintained (unless intentional breaking change)
- ✅ Migration path documented for breaking changes
- ✅ Dependencies are up to date and compatible

**5. Final Checks**

- ✅ PR description is clear and complete
- ✅ All review comments are addressed
- ✅ No unresolved discussions
- ✅ Ready for release (if applicable)
- ✅ Branch targets correct base branch (`develop` for features, `main` for hotfixes)

#### 6.2. Opening a Pull Request

**Before opening a Pull Request, ensure you have completed the [Pre-PR Checklist](#61-pre-pr-checklist) above.**

##### PR Description Workflow

**IMPORTANT:** Do not write PR descriptions directly in the GitHub UI. Follow this workflow:

1. **Create PR description file in `.pr-descriptions/` directory:**

   ```bash
   mkdir -p .pr-descriptions
   gh api repos/BehindTheMusicTree/.github/contents/.github/pull_request_template.md -H 'Accept: application/vnd.github.raw+json' > .pr-descriptions/feature-your-branch-name.md
   ```

2. **Edit the file locally** - Fill in all relevant sections, update as you work
3. **Copy to GitHub when ready** - When creating the PR, copy content from your file to GitHub
4. **Keep it updated** - Update the local file as you make changes or address feedback

##### PR Title Naming Convention

Pull Request titles must follow the same format as commit messages for consistency:

**Format:**

```
<type>(<optional-scope>): <short imperative description>
```

**Allowed Types:**

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code restructuring
- `docs` — documentation update
- `chore` — maintenance / infrastructure (dependency updates, tooling setup, repository configuration)
- `perf` — performance improvement
- `style` — formatting / lint-only changes
- `ci` — CI/CD pipeline changes (GitHub Actions workflows, CI configuration)
- `test` — adding or updating tests

**Rules:**

- Use imperative mood ("Add…", "Fix…", "Update…")
- Keep it under ~70 characters
- Include issue/ticket IDs when applicable (e.g., `fix(#482): handle null values`)
- Avoid "WIP" in titles — use draft PRs instead
- Use lowercase for type and scope (e.g., `feat(player):`, not `Feat(Player):`)

**Note on Branch Prefixes vs PR Title Types:**

Branch prefixes (`feature/`, `hotfix/`, `release/`, plus `dependabot/` and exact `main` when allowed) are for branch organization and differ from PR title types:

- Branch `feature/add-playlist-export` → PR title: `feat(playlist): add export functionality` (use `feat`, not `feature`)
- Branch `feature/player-preview-timeout` → PR title: `fix(player): handle preview timeout` (use `fix` for bug fixes; the branch stays `feature/*`)
- Branch `feature/update-dependencies` → PR title: `chore: update dependencies` (use `chore`)
- Branch `feature/update-validate-workflow` → PR title: `ci: …` or `chore: …` (branch stays `feature/*`; there are no `chore/*` or `ci/*` branch prefixes in this repo)
- Branch `hotfix/player-crash` → PR title: `fix(player): prevent crash on invalid track` (use `fix`, not `hotfix`)
- Branch `release/v0.2.0` → PR title: `chore: prepare release v0.2.0` (use `chore`)

**Note on GitHub's Auto-Suggested Titles:**

GitHub automatically generates PR titles based on branch names. **GitHub's auto-suggested titles do not follow our convention**, so you must rewrite them to match the standard format:

- ❌ **GitHub suggestion**: `Feature/add playlist export` (from branch `feature/add-playlist-export`)
- ✅ **Correct format**: `feat(playlist): add export functionality`

- ❌ **GitHub suggestion**: `Feature/update tailwind` (from branch `feature/update-tailwind`)
- ✅ **Correct format**: `chore: update tailwind to v3.4`

**Examples:**

- `feat(player): add shuffle mode`
- `fix(genre-tree): correctly render nested genres`
- `docs: update contributing guide`
- `chore: update dependencies`
- `test(track-list): add integration tests`
- `fix(#482): handle null search values`
- `perf(track-list): implement virtual scrolling`
- `style: format code with prettier`

##### Breaking Changes

If your PR includes breaking changes:

- ✅ Breaking changes are clearly documented in the PR description
- ✅ Migration path is provided (if applicable)
- ✅ Breaking changes include proper versioning notes (for maintainers to handle)

##### PR Automations

When you open a Pull Request, several automations may run automatically (if configured):

- **Auto-labeling**: Labels are automatically added based on files changed
- **Auto-assignment**: Reviewers may be automatically assigned
- **CI/CD checks**: Build and lint checks run on your PR
- **Welcome message**: First-time contributors receive a welcome message

**Note:** If you add a new feature or component, you can suggest updates to `.github/labeler.yml` via a PR to ensure future changes to that component are automatically labeled correctly.

### 7. Releasing _(For Maintainers)_

Before the first automated release, activate the policy on `main` in a separate
no-bump PR and provision the release App, as described in
[docs/VERSIONING.md](docs/VERSIONING.md).

Prepare each release or hotfix on its branch, including the version in
`package.json` and a matching dated section in `CHANGELOG.md`. Use
`npm pkg set version=X.Y.Z` to update the version without creating a commit or tag.
Open a PR to `main` and pass the production API compatibility check. Once merged,
the shared release workflow creates the immutable `vX.Y.Z` tag for the versioned
commit. Check that workflow before opening the required `main` → `develop`
back-merge PR. Never create or delete the release tag manually.

Coolify deploys production on pushes to `main` and staging on pushes to `develop`;
the tag does not trigger a deployment. See [docs/VERSIONING.md](docs/VERSIONING.md).

## 🏷️ Issue & PR Labels

This repository uses a comprehensive labeling system to categorize issues and pull requests. Labels are automatically applied to PRs based on file changes, and should be manually applied to issues during triage.

### Label Categories

- **Type** - bug, enhancement, feature, documentation, refactor, performance, accessibility, security
- **Priority** - critical, high, medium, low
- **Component** - player, genre-tree, track-list, playlist, auth, api, ui
- **Technology** - react, nextjs, typescript, tailwind, d3
- **Status** - needs-triage, needs-info, in-progress, blocked, ready, won't-fix
- **Size** - xs, s, m, l, xl (effort estimation)
- **Special** - good-first-issue, help-wanted, breaking-change, dependencies

For complete documentation including:

- Full list of labels with descriptions
- Color scheme and usage guidelines
- GitHub CLI commands to create all labels
- Automatic labeling configuration

See [.github/LABELS.md](.github/LABELS.md)

### Creating Labels (Maintainers Only)

```bash
# Create all labels at once
bash .github/scripts/create-labels.sh
```

### Automatic Labeling

This repository uses automated workflows to apply labels:

1. **File-based PR labeling** ([labeler.yml](.github/workflows/labeler.yml)) - Labels PRs based on changed files (components, technologies, documentation)
2. **PR size labeling** ([pr-size-labeler.yml](.github/workflows/pr-size-labeler.yml)) - Calculates and labels PR size (xs/s/m/l/xl) with line counts
3. **PR type labeling** ([pr-type-labeler.yml](.github/workflows/pr-type-labeler.yml)) - Detects type from title/description (feat, fix, docs, breaking changes)
4. **Issue labeling** ([issue-labeler.yml](.github/workflows/issue-labeler.yml)) - Auto-labels issues by type, component, platform, priority

These workflows reduce manual labeling overhead and ensure consistent label application across all issues and PRs.

## 🪪 License & Attribution

All contributions are made under the project's Apache License 2.0.

You retain authorship of your code; the project retains redistribution rights under the same license. See the [LICENSE](LICENSE) file for details.

## 📜 Code of Conduct

This project adheres to a Code of Conduct to ensure a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) when participating in this project.

## 📋 TODO List

This project may maintain a TODO list that tracks future work, improvements, and testing tasks. The TODO list is organized by priority and category:

- **Features** - New functionality and enhancements
- **Testing & Quality** - Test coverage, quality improvements, and validation
- **Infrastructure** - CI/CD, deployment, monitoring, and technical improvements
- **Documentation** - Documentation improvements and guides

**Important Notes**:

- **Maintainers are responsible** - Project maintainers are responsible for maintaining and updating the TODO list
- **Contributors should NOT modify it** - Contributors should not edit the TODO list directly
- **Suggest tasks via issues** - If you'd like to suggest a new task or work on an existing one, please open a GitHub issue first for discussion
- **Updated during releases** - Maintainers align and update the TODO list when releasing new versions based on project priorities, completed work, and community feedback

## 🌍 Contact & Discussions

You can open:

- **Issues** → bug reports or new ideas
  - Use issue templates if available
- **Discussions** → suggestions, architecture, or music-related topics

Let's make this music guide grow together 🌱
