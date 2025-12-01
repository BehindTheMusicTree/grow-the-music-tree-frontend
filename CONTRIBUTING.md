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
- Moving "Unreleased" changelog entries to versioned sections during releases
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
   git clone https://github.com/YOUR-USERNAME/bodzify-ultimate-music-guide-react.git
   cd bodzify-ultimate-music-guide-react
   ```

**For maintainers:**

Clone the main repository directly:

```bash
git clone https://github.com/Bodzify/bodzify-ultimate-music-guide-react.git
cd bodzify-ultimate-music-guide-react
```

### 1. Environment Setup

#### Prerequisites

- **Node.js 20.x or higher**
- **npm** (comes with Node.js)
- **Git**

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Bodzify/bodzify-ultimate-music-guide-react.git
   cd bodzify-ultimate-music-guide-react
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Create environment files based on the templates in `env/dev/template/`:

   ```bash
   # For local development
   npm run setup-env-dev-local

   # OR for remote API
   npm run setup-env-dev-remote
   ```

   This will create `.env.development` with the necessary configuration.

   **Note:** Environment variables are required for connecting to the Bodzify API backend.

4. Verify environment setup:

   ```bash
   npm run verify-env
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

#### Environment Variables

The application requires several environment variables to connect to the Bodzify API:

- `NEXT_PUBLIC_API_BASE_URL` - The base URL of the Bodzify API
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN for error tracking (optional)
- Additional environment variables for authentication and features

See `env/dev/template/` for complete environment variable templates.

#### Backend Requirement

This frontend application requires the Bodzify API backend to function. You can find the Bodzify API on GitHub at: [Bodzify API Django](https://github.com/Bodzify/bodzify-api-django)

For development, you can either:

- Run the backend locally (see backend repository for setup instructions)
- Use a remote API instance (configure via `NEXT_PUBLIC_API_BASE_URL`)

### 2. Branching

We follow **strict Git Flow** with the following branch structure:

#### Main Branch (`main`)

- The production-ready, stable branch
- All tests must pass before merging
- Releases are tagged from `main`
- **No direct commits allowed** - All changes must go through Pull Requests, including changes from maintainers
- Only receives merges from `release/*` and `hotfix/*` branches
- **Branch protection enforced** - GitHub Actions automatically blocks PRs to `main` that don't come from `hotfix/*` or `release/*` branches (if configured)

#### Develop Branch (`develop`)

- The integration branch for ongoing development
- All feature branches merge into `develop`
- `develop` is merged into `main` via release branches
- **No direct commits allowed** - All changes must go through Pull Requests
- Only receives merges from `feature/*`, `chore/*`, `release/*`, and `hotfix/*` branches
- **Branch protection enforced** - GitHub Actions automatically blocks PRs to `develop` that don't come from allowed branch types (if configured)

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
  git checkout -b release/v0.2.0
  ```

- Only bug fixes and release-related changes go into release branches
- When ready, merge into both `main` (for production) and `develop` (to keep develop up to date)
- Tag the release on `main` after merging

#### Hotfix Branches (`hotfix/<name>`) _(For Maintainers)_

- For urgent bug fixes on production versions
- Branch from `main`
- Include issue numbers when applicable: `hotfix/789-critical-player-crash`
- Examples:

  ```bash
  git checkout main
  git pull origin main
  git checkout -b hotfix/critical-auth-bug

  git checkout -b hotfix/789-fix-playlist-loading       # With issue number
  ```

- Contributors can submit fixes via feature branches that maintainers may promote to hotfixes if needed
- When complete, merge into both `main` (for immediate production fix) and `develop` (to keep develop up to date)

#### Chore Branches (`chore/<name>`)

- For maintenance, infrastructure, and configuration work
- Branch from `develop`
- Include issue numbers when applicable: `chore/234-update-dependencies`
- Examples: repository setup, CI/CD changes, dependency updates, documentation infrastructure
- Examples:

  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b chore/github-setup
  git checkout -b chore/update-dependencies
  git checkout -b chore/234-setup-eslint                # With issue number
  ```

- Merge into `develop` via Pull Request when complete

### 3. Developing

#### Code Style Guidelines

- **TypeScript**: Use TypeScript for all new components and utilities
- **React**: Follow React best practices and hooks conventions
- **Next.js**: Leverage Next.js App Router features (Server Components, Client Components, Server Actions)
- **Styling**: Use Tailwind CSS for styling (see `.cursor/rules/use-tailwind.mdc`)
- **Component Structure**: Keep components focused and reusable
- **State Management**: Use React Context for global state, React Query for server state
- **File Organization**: Follow the existing project structure in `src/`

#### Key Directories

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
  - `src/components/features/` - Feature-specific components
  - `src/components/ui/` - Generic UI components
- `src/contexts/` - React Context providers
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and helpers
- `src/schemas/` - Zod validation schemas
- `src/models/` - TypeScript types and interfaces
- `src/utils/` - General utility functions

#### Best Practices

- Write semantic, accessible HTML
- Use TypeScript types/interfaces for props and data structures
- Follow the existing naming conventions
- Keep components small and focused
- Use custom hooks to extract reusable logic
- Implement error boundaries for error handling
- Use React Query for API data fetching
- Follow the Tailwind CSS class ordering convention (see `.cursor/rules/tailwind-order.mdc`)
- Avoid useless comments (see `.cursor/rules/no-useless-comments.mdc`)

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
- ✅ Branch follows naming convention (`feature/`, `chore/`, `hotfix/`, `release/`)

**5. Branch Target**

- ✅ Feature branches target `develop` branch (NOT `main`)
- ✅ Hotfix branches target `main` branch
- ✅ Release branches target both `main` and `develop` (maintainers only)
- ✅ Chore branches target `develop` branch (NOT `main`)

**6. PR Description**

- ✅ PR description drafted in `.pr-descriptions/<branch-name>.md` (see `.cursor/rules/pr-description-workflow.mdc`)
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
   cp .github/pull_request_template.md .pr-descriptions/feature-your-branch-name.md
   ```

2. **Edit the file locally** - Fill in all relevant sections, update as you work
3. **Copy to GitHub when ready** - When creating the PR, copy content from your file to GitHub
4. **Keep it updated** - Update the local file as you make changes or address feedback

See `.cursor/rules/pr-description-workflow.mdc` for detailed guidelines.

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

Branch prefixes (`feature/`, `chore/`, `hotfix/`, `release/`) are for branch organization and differ from PR title types:

- Branch `feature/add-playlist-export` → PR title: `feat(playlist): add export functionality` (use `feat`, not `feature`)
- Branch `chore/update-dependencies` → PR title: `chore: update dependencies` (use `chore`)
- Branch `hotfix/player-crash` → PR title: `fix(player): prevent crash on invalid track` (use `fix`, not `hotfix`)
- Branch `release/v0.2.0` → PR title: `chore: prepare release v0.2.0` (use `chore`)

**Note on GitHub's Auto-Suggested Titles:**

GitHub automatically generates PR titles based on branch names. **GitHub's auto-suggested titles do not follow our convention**, so you must rewrite them to match the standard format:

- ❌ **GitHub suggestion**: `Feature/add playlist export` (from branch `feature/add-playlist-export`)
- ✅ **Correct format**: `feat(playlist): add export functionality`

- ❌ **GitHub suggestion**: `Chore/update tailwind` (from branch `chore/update-tailwind`)
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

Releases are created from the `main` branch using **strict Git Flow**.

Quick release process:

1. **Ensure `develop` is ready for release** - All features for the release should be merged into `develop`

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create a release branch from `develop`**

   ```bash
   git checkout -b release/v0.2.0
   git push origin release/v0.2.0
   ```

3. **On the release branch, prepare the release:**

   - Review and finalize `CHANGELOG.md`:

     - Review changes in the `[Unreleased]` section
     - Move content from `[Unreleased]` section to new version entry with date (e.g., `## [v0.2.0] - 2025-12-15`)
     - Review and consolidate entries if needed
     - Leave the `[Unreleased]` section empty (or with a placeholder) for future PRs

   - Update version in `package.json`:

     ```bash
     npm version 0.2.0 --no-git-tag-version
     ```

   - Make any final bug fixes or adjustments on the release branch
   - Ensure build completes: `npm run build`
   - Ensure no linting errors: `npm run lint`

4. **Merge release branch into `main`**

   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff release/v0.2.0
   git push origin main
   ```

5. **Tag the release on `main`**

   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```

   **Important:** The tag version must match the version in `CHANGELOG.md` and `package.json` (with the `v` prefix).

6. **Merge release branch back into `develop`** (to keep develop up to date)

   ```bash
   git checkout develop
   git pull origin develop
   git merge --no-ff release/v0.2.0
   git push origin develop
   ```

7. **Delete the release branch** (locally and remotely)

   ```bash
   git branch -d release/v0.2.0
   git push origin --delete release/v0.2.0
   ```

8. **CI/CD will automatically:**

   - Build the application
   - Run tests and linting
   - Deploy if configured

**Hotfix Release Process:**

For urgent production fixes:

1. Create hotfix branch from `main`:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-player-crash
   ```

2. Make the fix and update `CHANGELOG.md` in the `[Unreleased]` section

3. Update version in `package.json`:

   ```bash
   npm version patch --no-git-tag-version
   ```

4. Merge hotfix into `main`:

   ```bash
   git checkout main
   git merge --no-ff hotfix/critical-player-crash
   git tag v0.1.3  # Increment patch version
   git push origin main --tags
   ```

5. Merge hotfix into `develop`:

   ```bash
   git checkout develop
   git merge --no-ff hotfix/critical-player-crash
   git push origin develop
   ```

6. Delete the hotfix branch

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
